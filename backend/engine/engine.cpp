#include <iostream>
#include "json.hpp"
using namespace std;
using json = nlohmann::json;

int main() {
    json input;
    cin>>input;

    int number = input["number"];
    string operation = input["operation"];

    json output;

    if(operation == "square") {
        output["result"] = number * number;
    }

    cout << output.dump() << endl;

    return 0;
}