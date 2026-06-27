// Write your code here...
#include <iostream>
using namespace std;

int main() {
    int n, target;
    cin >> n;
    
    int nums[n];
    for(int i=0; i<n; i++) {
        cin >> nums[i];
    }
    
    cin >> target;
    
    for(int i=0; i<n; i++) {
        for(int j=i+1; j<n; j++) {
            if(nums[i] + nums[j] == target) {
                cout << i << " " << j << endl;
                return 0;
            }
        }
    }
    return 0;
}