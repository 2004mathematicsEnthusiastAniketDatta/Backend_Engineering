#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/crypto.h>

#define BUFFER_SIZE 4096

// Initialize OpenSSL
void init_openssl() {
    SSL_library_init();
    SSL_load_error_strings();
    OpenSSL_add_all_algorithms();
}

// Cleanup OpenSSL
void cleanup_openssl() {
    EVP_cleanup();
    ERR_free_strings();
}

// Create SSL context
SSL_CTX* create_ssl_context() {
    const SSL_METHOD *method;
    SSL_CTX *ctx;

    method = TLS_client_method();
    ctx = SSL_CTX_new(method);
    if (!ctx) {
        perror("Unable to create SSL context");
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }

    // Set verification mode
    SSL_CTX_set_verify(ctx, SSL_VERIFY_PEER, NULL);
    SSL_CTX_set_verify_depth(ctx, 4);

    // Load CA certificates
    if (SSL_CTX_load_verify_locations(ctx, "/etc/ssl/certs/ca-certificates.crt", NULL) != 1) {
        fprintf(stderr, "Warning: Could not load CA certificates\n");
    }

    return ctx;
}

// Create socket and connect to server
int create_socket(const char *hostname, const char *port) {
    int sockfd;
    struct addrinfo hints, *servinfo, *p;
    int rv;

    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    if ((rv = getaddrinfo(hostname, port, &hints, &servinfo)) != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
        return -1;
    }

    for (p = servinfo; p != NULL; p = p->ai_next) {
        if ((sockfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) == -1) {
            perror("socket");
            continue;
        }

        if (connect(sockfd, p->ai_addr, p->ai_addrlen) == -1) {
            close(sockfd);
            perror("connect");
            continue;
        }

        break;
    }

    freeaddrinfo(servinfo);

    if (p == NULL) {
        fprintf(stderr, "Failed to connect\n");
        return -1;
    }

    return sockfd;
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        printf("Usage: %s <hostname> <port>\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    const char *hostname = argv[1];
    const char *port = argv[2];
    
    int sockfd;
    SSL_CTX *ctx;
    SSL *ssl;
    char buffer[BUFFER_SIZE];
    int bytes;

    // Initialize OpenSSL
    init_openssl();
    ctx = create_ssl_context();

    // Create socket connection
    sockfd = create_socket(hostname, port);
    if (sockfd < 0) {
        exit(EXIT_FAILURE);
    }

    // Create SSL structure
    ssl = SSL_new(ctx);
    SSL_set_fd(ssl, sockfd);

    // Set hostname for SNI
    SSL_set_tlsext_host_name(ssl, hostname);

    // Perform SSL handshake
    if (SSL_connect(ssl) <= 0) {
        ERR_print_errors_fp(stderr);
        SSL_free(ssl);
        close(sockfd);
        SSL_CTX_free(ctx);
        cleanup_openssl();
        exit(EXIT_FAILURE);
    }

    printf("Connected with %s encryption\n", SSL_get_cipher(ssl));

    // Send HTTP GET request
    snprintf(buffer, sizeof(buffer),
        "GET / HTTP/1.1\r\n"
        "Host: %s\r\n"
        "Connection: close\r\n"
        "User-Agent: HTTPS-Client/1.0\r\n"
        "\r\n", hostname);

    if (SSL_write(ssl, buffer, strlen(buffer)) <= 0) {
        ERR_print_errors_fp(stderr);
    } else {
        printf("Request sent:\n%s\n", buffer);
    }

    // Read response
    printf("Server response:\n");
    do {
        bytes = SSL_read(ssl, buffer, sizeof(buffer) - 1);
        if (bytes > 0) {
            buffer[bytes] = '\0';
            printf("%s", buffer);
        }
    } while (bytes > 0);

    // Cleanup
    SSL_shutdown(ssl);
    SSL_free(ssl);
    close(sockfd);
    SSL_CTX_free(ctx);
    cleanup_openssl();

    return 0;
}