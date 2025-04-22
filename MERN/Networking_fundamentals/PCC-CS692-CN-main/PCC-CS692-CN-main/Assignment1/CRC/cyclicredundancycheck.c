#include <stdio.h>
#include <string.h> // This line tells the compiler to include the standard C library for string operations. This library provides functions for working with sequences of characters (strings), like copying them or finding their length.

#define MAX 100 // This line defines a symbolic constant named MAX and gives it the value 100. It's like creating a shortcut. Anywhere we write MAX later, the compiler will replace it with 100. This is often used to set a maximum size for things like arrays.

// This line starts the definition of a function named 'xorDivision'.
// A function is a block of code that performs a specific task.
// 'void' means this function doesn't return any value back to where it was called from.
// It takes three inputs (called parameters or arguments):
// - dividend[]: An array of characters (a string) representing the data message.
// - divisor[]: An array of characters (a string) representing the generator polynomial (in binary).
// - remainder[]: An array of characters (a string) where the function will store the calculated remainder.
void xorDivision(char dividend[] , char divisor[], char remainder[]){
    // This line declares an integer variable named 'dividendLen' to store the length of the dividend string.
    // 'strlen(dividend)' is a function from the <string.h> library that calculates the number of characters in the 'dividend' string (excluding the hidden null character at the end).
    int dividendLen = strlen(dividend);
    // This line declares an integer variable named 'divisorLen' and stores the length of the 'divisor' string in it, using the 'strlen' function again.
    int divisorLen = strlen(divisor);
    // This line declares an array of characters named 'temp' that can hold up to MAX (100) characters. This array will be used for temporary calculations during the division process.
    char temp[MAX];
    // This line copies the first 'divisorLen' characters from the 'dividend' string into the 'temp' string.
    // 'strncpy' is a function from <string.h> for copying strings, but it's safer because it takes a maximum number of characters to copy.
    strncpy(temp, dividend, divisorLen);
    // This line adds a special character '\0' (called the null terminator) at the end of the characters just copied into 'temp'. In C, strings are expected to end with this character so functions like 'strlen' know where the string ends.
    temp[divisorLen] ='\0';
    // This line starts a 'for' loop. A loop repeats a block of code multiple times.
    // 'int i = divisorLen;': It initializes an integer variable 'i' with the value of 'divisorLen'. 'i' will act as a counter and index.
    // 'i <= dividendLen;': This is the condition. The loop will continue as long as 'i' is less than or equal to 'dividendLen'.
    // 'i++': After each repetition (iteration) of the loop, the value of 'i' is increased by 1.
    // This loop processes the dividend bit by bit (or character by character in this case).
    for (int i = divisorLen; i <= dividendLen ; i++){
        // This line checks if the first character (at index 0) of the 'temp' string is '1'.
        // In binary polynomial division (which CRC uses), if the leftmost bit of the current part of the dividend is 1, we perform an XOR operation with the divisor.
        if(temp[0] == '1'){
            // This line starts another 'for' loop nested inside the first one.
            // 'int j = 0;': Initializes a counter 'j' to 0.
            // 'j < divisorLen;': The loop continues as long as 'j' is less than the length of the divisor.
            // 'j++': Increments 'j' by 1 after each iteration.
            // This loop iterates through each character of the 'temp' (up to the length of the divisor) and the 'divisor'.
            for (int j = 0; j < divisorLen; j++){
                // This line performs the XOR operation for each corresponding character pair from 'temp' and 'divisor'.
                // '(temp[j] == divisor[j])': This checks if the character at index 'j' in 'temp' is the same as the character at index 'j' in 'divisor'.
                // '? '0' : '1'': This is a ternary operator. If the condition is true (characters are the same), the result is '0'. If the condition is false (characters are different), the result is '1'. This mimics the XOR logic (0 XOR 0 = 0, 1 XOR 1 = 0, 0 XOR 1 = 1, 1 XOR 0 = 1).
                // 'temp[j] = ...': The calculated result ('0' or '1') is stored back into the 'temp' string at the current index 'j'.
                temp[j] = (temp[j] == divisor[j]) ? '0' : '1';
            }
        }
        // This line checks if the outer loop counter 'i' is still less than the total length of the original dividend.
        // This is important because we need to bring down the next bit (character) from the dividend after each XOR step, but only if there are bits left.
        if ( i < dividendLen ) {
            // This line shifts the characters in the 'temp' string one position to the left.
            // 'memmove' is a function (from <string.h>) used to copy blocks of memory. It's safe to use even when the source and destination memory areas overlap.
            // 'temp + 1': This points to the second character (index 1) of the 'temp' string.
            // 'divisorLen - 1': This is the number of characters to move (all characters except the first one).
            // Effectively, this discards the first character (which should be '0' after the XOR if it was performed) and shifts everything else left.
            memmove(temp, temp + 1, divisorLen - 1);
            // This line takes the next character from the original 'dividend' (at index 'i') and places it at the end of the 'temp' string (at index 'divisorLen - 1'). This is like "bringing down" the next bit in long division.
            temp[divisorLen - 1] = dividend[i];
            temp[divisorLen] = '\0';
        }
    }
    strncpy(remainder, temp + 1 , divisorLen - 1);
    remainder[divisorLen - 1] = '\0';
}
int main(){
    char dividend[MAX], divisor[MAX], remainder[MAX],transmittedData[MAX];
    printf("Enter the dividend (Binary String): ");
    scanf("%s", dividend);
    printf("Enter the divisor ( Polynomial in Binary ) :");
    scanf("%s", divisor);
    int dividendLen = strlen(dividend);
    int divisorLen = strlen(divisor);
    char extendedDividend[MAX];
    strcpy(extendedDividend, dividend);
    for (int i = 0; i < divisorLen - 1; i++)
    {
        extendedDividend[dividendLen + i] = '0';
    }
    extendedDividend[dividendLen + divisorLen - 1] = '\0';
    xorDivision(extendedDividend, divisor, remainder);
    strcpy(transmittedData, dividend);
    strcat(transmittedData, remainder);
    printf("Transmitted Data (Original Dividend + remainder) : %s\n", transmittedData);
    char receivedRemainder[MAX];
    xorDivision(transmittedData, divisor, receivedRemainder);
    int isValid = 1;
    for (int i = 0; i < divisorLen - 1; i++){
        if(receivedRemainder[i] != '0'){
            isValid = 0;
            break;
        }
    }
    if (isValid){
        printf("Cyclic Redundancy check Passed! Data received successfully without error.\n");
    } else {
        printf("Cyclic Redundancy Check Failed ! Error detected in received data.\n");
    }
    return 0;
}
