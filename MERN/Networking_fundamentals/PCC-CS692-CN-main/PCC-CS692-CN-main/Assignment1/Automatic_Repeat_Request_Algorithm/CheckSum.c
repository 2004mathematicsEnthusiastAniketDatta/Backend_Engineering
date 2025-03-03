#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

/**
 * Adds two binary strings and returns the result
 * @param binary1 - First binary string
 * @param binary2 - Second binary string
 * @param result - Output parameter to store the result
 * @param length - Length of the binary strings
 */
void add_binary_strings(const char *binary1, const char *binary2, char *result, int length) {
    int carry = 0;
    
    // Process from right to left (least significant bit to most significant bit)
    for (int i = length - 1; i >= 0; i--) {
        // Convert character '0'/'1' to integer 0/1 and add
        int bit1 = binary1[i] - '0';
        int bit2 = binary2[i] - '0';
        int sum = bit1 + bit2 + carry;
        
        // Calculate result bit and carry
        result[i] = (sum % 2) + '0';  // Remainder is the result bit
        carry = sum / 2;               // Quotient is the carry bit
    }
    
    printf("Sum before handling overflow: %s (carry: %d)\n", result, carry);
    
    // Handle overflow (end-around carry)
    while (carry > 0) {
        carry = 0;
        // Add 1 to the result (end-around carry)
        for (int i = length - 1; i >= 0; i--) {
            if (result[i] == '0') {
                result[i] = '1';
                break;  // No further carry needed
            } else {
                result[i] = '0';  // This position generates a carry
                carry = 1;
            }
        }
        printf("Sum after handling overflow: %s (carry: %d)\n", result, carry);
    }
}

/**
 * Computes the one's complement of a binary string (flips all bits)
 * @param binary - Binary string to be complemented
 * @param length - Length of the binary string
 */
void ones_complement(char *binary, int length) {
    for (int i = 0; i < length; i++) {
        // Flip 0 to 1 and 1 to 0
        binary[i] = (binary[i] == '0') ? '1' : '0';
    }
    printf("One's complement: %s\n", binary);
}

/**
 * Validates if a string contains only binary digits ('0' and '1')
 * @param str - String to validate
 * @return true if string is binary, false otherwise
 */
bool is_binary(const char *str) {
    while (*str) {
        if (*str != '0' && *str != '1')
            return false;
        str++;
    }
    return true;
}

/**
 * Simulates the receiver's verification process
 * @param data1 - First data frame
 * @param data2 - Second data frame
 * @param checksum - Checksum received
 * @param length - Length of the binary strings
 */
void verify_checksum(const char *data1, const char *data2, const char *checksum, int length) {
    char sum[length + 1];       // To store sum of data1 and data2
    char final_sum[length + 1]; // To store final sum
    
    // Null terminate the strings
    sum[length] = '\0';
    final_sum[length] = '\0';
    
    printf("\n--- RECEIVER SIDE ---\n");
    
    // Step 1: Add the original data frames
    printf("Step 1: Adding the two data frames\n");
    add_binary_strings(data1, data2, sum, length);
    
    // Step 2: Add the checksum
    printf("\nStep 2: Adding the checksum to the sum\n");
    add_binary_strings(sum, checksum, final_sum, length);
    
    // Step 3: Take one's complement
    printf("\nStep 3: Computing one's complement of the final sum\n");
    ones_complement(final_sum, length);
    
    // Step 4: Check if result is all zeros (valid) or not (error detected)
    bool valid = true;
    for (int i = 0; i < length; i++) {
        if (final_sum[i] != '0') {
            valid = false;
            break;
        }
    }
    
    printf("\nVERIFICATION RESULT: ");
    if (valid) {
        printf("No errors detected! The data is valid.\n");
    } else {
        printf("Error detected! The data has been corrupted.\n");
    }
}

int main() {
    char data1[100], data2[100], checksum[100];
    int length;
    
    // Get input data
    printf("Enter first binary string: ");
    scanf("%s", data1);
    
    printf("Enter second binary string: ");
    scanf("%s", data2);
    
    // Validate input
    length = strlen(data1);
    if (strlen(data2) != length) {
        printf("Error: Both strings must have the same length.\n");
        return 1;
    }
    
    if (!is_binary(data1) || !is_binary(data2)) {
        printf("Error: Strings must contain only binary digits (0 and 1).\n");
        return 1;
    }
    
    // Initialize checksum
    strcpy(checksum, data1);  // Just to allocate the right size
    
    printf("\n--- SENDER SIDE ---\n");
    
    // Step 1: Add the data frames
    printf("Step 1: Adding the data frames\n");
    add_binary_strings(data1, data2, checksum, length);
    
    // Step 2: Generate the checksum by taking one's complement
    printf("\nStep 2: Computing the checksum (one's complement of the sum)\n");
    ones_complement(checksum, length);
    
    printf("\nGenerated checksum: %s\n", checksum);
    
    // Step 3: Simulate the receiver side verification
    verify_checksum(data1, data2, checksum, length);
    
    return 0;
}