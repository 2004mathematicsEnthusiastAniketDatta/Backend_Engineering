#include <stdio.h> // Include standard input/output library for functions like printf and scanf
#include <stdlib.h> // Include standard library for general purpose functions
#include <string.h> // Include string library for string manipulation functions like strlen

#include <math.h> // Include math library for mathematical functions


int input[32];
int code[32];
int hamming_calc(int, int);

void main(){
    int n,i,p_n=0,c_1,j,k;
    printf("Enter the length of the Dataword:");
    scanf("%d",&n);
    printf("Enter the Dataword:");
    for(int i=0;i<n;i++){
        scanf("%d",&input[i]);
    }
    i=0;
    while(pow(2,i)-(i+1) < n )
    {
        p_n++;
        i++;
    }
    c_1 = p_n + n;
    j=k=0;
    for ( i = 0; i < c_1; i++)
    {
        if(i==((int)pow(2,k)-1))
        {
            code[i]=0;
            k++;
        }
        else
        {
            code[i]=input[i];
            j++;
        }
    }
    for ( i = 0; i < p_n ; i++)
    {
        int position = (int)pow(2,i);
        int value = hamming_calc(position,c_1);
        code[position] = value;
    }

    printf("The calculated code word is: ");
    
    for ( i = 0; i < c_1; i++)
    {
        printf("%d",code[i]);
        printf("\n");
    }
    
    printf("Please enter the received code word: ");

    for ( i = 0; i < c_1 ; i++)
    {
        scanf("%d",&code[i]);
    }
    
    int error_position = 0;
    for ( i = 0; i < p_n ; i++)
    {
        int position = (int)pow(2,i);
        int value = hamming_calc(position,c_1);
        if (value!=0)
        {
            error_position = position ;
        }
        if (error_position == 1)
        {
            printf("The received code word is correct!\n");
        }
        else
        {
            printf("Error at bit position %d\n",error_position);
        }
    }
}

int hamming_calc(int position, int c_1)
{
    int count = 0,i,j;

    i = position - 1;

    while (i<c_1)
    {
        for ( j = i; j < i + position ; j++ )
        {
            if (code[j] == 1)
            {
                count++;
            }
        }
        i = i + (2 * position);
    }

    if (count % 2 == 0)
    {
        return 0;
    }
    else
    {
        return 1;
    }
}