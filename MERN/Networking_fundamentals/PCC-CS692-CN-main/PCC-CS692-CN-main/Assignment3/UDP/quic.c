// single_file_quiche_h3_client.c
// -----------------------------------------------------------------------------
// A single-file, heavily commented, minimal HTTP/3 client built on top of
// Cloudflare's quiche (QUIC + HTTP/3) library.
//
// What this does
//  - Opens a UDP socket to a host.
//  - Establishes a QUIC connection using quiche.
//  - Upgrades to HTTP/3 and issues a single GET request.
//  - Prints the response headers and body to stdout.
//
// Build (example, Linux):
//  - You need libquiche installed with the C headers available (quiche.h).
//  - You also need BoringSSL/LibreSSL/OpenSSL as quiche depends on TLS.
//
//    cc -O2 -Wall -Wextra -o h3c single_file_quiche_h3_client.c \
//       -lquiche -lcrypto -lpthread
//
// Run:
//    ./h3c https://cloudflare-quic.com/ /
//    ./h3c https://example.com/ /
//    ./h3c https://<host>:<port>/ /path
//
// Notes & caveats
//  - This focuses on readability over edge-case completeness.
//  - Error handling is reasonably thorough but compact.
//  - It uses select() and non-blocking UDP for portability.
//  - The quiche C API evolves; if a call signature differs on your version,
//    check the installed quiche.h and adjust accordingly.
// -----------------------------------------------------------------------------

#include <stdio.h>      // printf(), fprintf(), perror()
#include <stdlib.h>     // exit(), strtoul(), malloc(), free()
#include <stdint.h>     // uint8_t, uint64_t, etc.
#include <stdbool.h>    // bool
#include <string.h>     // memset(), memcpy(), strlen(), strcmp()
#include <errno.h>      // errno
#include <time.h>       // clock_gettime(), nanosleep()
#include <unistd.h>     // close()
#include <fcntl.h>      // fcntl()
#include <sys/types.h>  // socket types
#include <sys/socket.h> // socket(), sendto(), recvfrom()
#include <netdb.h>      // getaddrinfo()
#include <arpa/inet.h>  // inet_ntop()

#include <quiche.h>     // quiche public C API

// ----------------------------- Utility helpers ------------------------------

// set_nonblocking(): put a file descriptor into non-blocking mode.
static int set_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL, 0);            // fetch current flags
    if (flags < 0) return -1;                     // bail if failed
    if (fcntl(fd, F_SETFL, flags | O_NONBLOCK) < 0) return -1; // set O_NONBLOCK
    return 0;                                     // success
}

// now_millis(): current time in milliseconds for simple timeouts.
static uint64_t now_millis(void) {
    struct timespec ts;                           // POSIX timespec
    clock_gettime(CLOCK_MONOTONIC, &ts);          // monotonic clock
    return (uint64_t)ts.tv_sec * 1000ULL + (ts.tv_nsec / 1000000ULL);
}

// die(): print message and exit.
static void die(const char *msg) {
    fprintf(stderr, "%s\n", msg);               // write error to stderr
    exit(EXIT_FAILURE);                           // terminate
}

// parse_url(): naive URL parser for forms like https://host[:port]/path
// Fills scheme ("https"), host, port (default 443), and path (default "/").
static void parse_url(const char *url,
                      char *scheme, size_t scheme_sz,
                      char *host,   size_t host_sz,
                      char *port,   size_t port_sz,
                      char *path,   size_t path_sz) {
    // Very small, permissive parsing for demo. Not RFC-perfect.
    // Expected: scheme://host[:port]/path

    const char *p = strstr(url, "://");         // find scheme separator
    if (!p) die("URL must be like https://host[:port]/path");

    size_t s_len = (size_t)(p - url);