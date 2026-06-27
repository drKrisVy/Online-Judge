// Write your code here...
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    // 1. Read the number of elements in the array
    int n;
    if (!(cin >> n)) return 0; // Handle empty input gracefully

    // 2. Read the array elements
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // 3. Read the target sum
    int target;
    cin >> target;

    // 4. The O(n) Hash Map Algorithm
    unordered_map<int, int> numMap;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        
        // If we have seen the complement before, we found our pair!
        if (numMap.count(complement)) {
            // Print the indices separated by a space (matching expected standard output)
            cout << numMap[complement] << " " << i << endl;
            return 0;
        }
        
        // Otherwise, store the current number and its index in the map
        numMap[nums[i]] = i;
    }

    return 0;
}