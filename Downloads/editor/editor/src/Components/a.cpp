#include <iostream>
#include <string>
using namespace std;

string to_upper(string s) {
  string result = "";
  for (char c : s) {
    if (c >= 'a' && c <= 'z') {
      result += c - 32;
    } else {
      result += c;
    }
  }
  return result;
}

int ascii_sum(string s) {
  int sum = 0;
  for (char c : s) {
    sum += c;
  }
  return sum;
}

int reduce_to_single_digit(int n) {
  while (n > 9) {
    int temp = 0;
    while (n > 0) {
      temp += n % 10;
      n /= 10;
    }
    n = temp;
  }
  return n;
}

int lucky_number(string name) {
  name = to_upper(name);
  int sum = ascii_sum(name);
  int lucky = reduce_to_single_digit(sum);
  return lucky;
}

int main() {
  string name;
  cout << "Enter your name: ";
  cin >> name;
  int lucky = lucky_number(name);
  cout << "Your lucky number is: " << lucky << endl;
  return 0;
}
