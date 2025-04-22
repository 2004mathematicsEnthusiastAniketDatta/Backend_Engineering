#include <stdio.h> // Include standard input/output library for functions like printf and scanf
#include <stdlib.h> // Include standard library for general purpose functions
#include <string.h> // Include string library for string manipulation functions like strlen

// Function to calculate the even parity bit for a given binary string
int calculate_parity(const char * binary){
    int count=0; // Initialize a counter for the number of '1's to zero
    // Loop through each character in the binary string until the null terminator is reached
    for(int i = 0 ; binary[i] != '\0' ; i++ ) {
        // Check if the current character is '1'
        if ( binary[i] == '1' ) {
            count ++; // Increment the counter if the character is '1'
        }
    }
    // Return 0 if the count of '1's is even, and 1 if it's odd (this calculates the even parity bit)
    return ( count % 2 );

}

// Main function where the program execution begins
int main(){
    char binary[50]; // Declare a character array to store the input binary data (up to 49 characters + null terminator)
    printf("Enter binary data : "); // Prompt the user to enter binary data
    scanf("%s",binary); // Read the binary data entered by the user and store it in the 'binary' array
    int parity_bit = calculate_parity(binary); // Calculate the parity bit for the entered binary data
    // Print the original binary data along with the calculated parity bit
    printf("Transmitted Data with Parity: %s %d \n",binary,parity_bit);
    char received_data[51]; // Declare a character array to store the received data including the parity bit (up to 50 characters + null terminator)
    printf("Enter received data with parity: "); // Prompt the user to enter the received data (data + parity bit)
    scanf("%s",received_data); // Read the received data entered by the user
    // Extract the received parity bit (last character of the received string) and convert it from char to int
    int received_parity = received_data[strlen(received_data) - 1] - '0';
    // Remove the parity bit from the received data string by placing a null terminator before it
    received_data[strlen(received_data)-1] = '\0';
    // Recalculate the parity of the received data (without the parity bit) and compare it with the received parity bit
    if (received_parity == calculate_parity(received_data))
    {
        // If the calculated parity matches the received parity, print "Parity Check Passed"
        printf("Parity Check Passed\n");
    }
    else
    {
        // If the calculated parity does not match the received parity, print "Parity Check Failed!"
        printf("Parity Check Failed!\n");
    }
    return 0; // Indicate successful program execution
}
