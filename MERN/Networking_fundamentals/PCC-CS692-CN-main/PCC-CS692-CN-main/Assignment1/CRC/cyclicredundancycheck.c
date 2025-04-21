#include <stdio.h>
#include <string.h>

#define MAX 100

void xorDivision(char dividend[] , char divisor[], char remainder[]){
    int dividendLen = strlen(dividend);
    int divisorLen = strlen(divisor);
    char temp[MAX];
    strncpy(temp, dividend, divisorLen);
    temp[divisorLen] ='\0';
    for (int i = divisorLen; i <= dividendLen ; i++){
        if(temp[0] == '1'){
            for (int j = 0; j < divisorLen; j++){
                temp[j] = (temp[j] == divisor[j]) ? '0' : '1';
            }
        }
        if ( i < dividendLen ) {
            memmove(temp, temp + 1, divisorLen - 1);
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