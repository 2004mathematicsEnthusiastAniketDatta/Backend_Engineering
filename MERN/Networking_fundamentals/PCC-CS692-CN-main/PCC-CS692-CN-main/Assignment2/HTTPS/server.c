#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <openssl/ssl.h>
#include <openssl/err.h>

#define PORT 8443
#define BUFFER_SIZE 1024

void init_openssl() {
    SSL_load_error_strings();
    OpenSSL_add_ssl_algorithms();
}

void cleanup_openssl() {
    EVP_cleanup();
}

SSL_CTX *create_context() {
    const SSL_METHOD *method;
    SSL_CTX *ctx;

    method = TLS_server_method();
    ctx = SSL_CTX_new(method);
    if (!ctx) {
        perror("Unable to create SSL context");
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }

    return ctx;
}

void configure_context(SSL_CTX *ctx) {
    // Set certificate and private key files
    if (SSL_CTX_use_certificate_file(ctx, "server.crt", SSL_FILETYPE_PEM) <= 0) {
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }

    if (SSL_CTX_use_PrivateKey_file(ctx, "server.key", SSL_FILETYPE_PEM) <= 0) {
        ERR_print_errors_fp(stderr);
        exit(EXIT_FAILURE);
    }
}

int create_socket(int port) {
    int sockfd;
    struct sockaddr_in addr;

    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("Unable to create socket");
        exit(EXIT_FAILURE);
    }

    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;

    if (bind(sockfd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        perror("Unable to bind");
        exit(EXIT_FAILURE);
    }

    if (listen(sockfd, 1) < 0) {
        perror("Unable to listen");
        exit(EXIT_FAILURE);
    }

    return sockfd;
}

int main() {
    int sockfd, client;
    SSL_CTX *ctx;
    SSL *ssl;
    char buffer[BUFFER_SIZE];
    int bytes;

    init_openssl();
    ctx = create_context();
    configure_context(ctx);

    sockfd = create_socket(PORT);

    printf("HTTPS Server listening on port %d\n", PORT);

    while (1) {
        struct sockaddr_in addr;
        uint len = sizeof(addr);

        client = accept(sockfd, (struct sockaddr*)&addr, &len);
        if (client < 0) {
            perror("Unable to accept");
            exit(EXIT_FAILURE);
        }

        ssl = SSL_new(ctx);
        SSL_set_fd(ssl, client);

        if (SSL_accept(ssl) <= 0) {
            ERR_print_errors_fp(stderr);
        } else {
            // Read client request
            bytes = SSL_read(ssl, buffer, sizeof(buffer));
            if (bytes > 0) {
                buffer[bytes] = '\0';
                printf("Client message: %s\n", buffer);
                
                // Send HTTP response
                const char *response = 
                    "HTTP/1.1 200 OK\r\n"
                    "Content-Type: text/html\r\n"
                    "Content-Length: 53\r\n"
                    "\r\n"
                    "<html><body><h1>Secure HTTPS Server</h1></body></html>";
                
                SSL_write(ssl, response, strlen(response));
            }
        }

        SSL_shutdown(ssl);
        SSL_free(ssl);
        close(client);
    }

    close(sockfd);
    SSL_CTX_free(ctx);
    cleanup_openssl();

    return 0;
}