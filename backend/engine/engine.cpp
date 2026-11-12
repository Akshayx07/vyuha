#include <iostream>
#include <cmath>
#include "json.hpp"
using namespace std;
using json = nlohmann::json;

int main() {
    json input;
    cin>>input;

    string requestId = input["requestId"];
    string action = input["action"];
    json origin = input["payload"]["origin"]["coordinates"];
    json destination = input["payload"]["destination"]["coordinates"];

    double originLongitude = origin[0];
    double originLatitude = origin[1];
    
    double destinationLongitude = destination[0];
    double destinationLatitude = destination[1];

    originLongitude = originLongitude * acos(-1.0) / 180;
    originLatitude = originLatitude * acos(-1.0) / 180;

    destinationLongitude = destinationLongitude * acos(-1.0) / 180;
    destinationLatitude = destinationLatitude * acos(-1.0) / 180;

    json output;

    cout << output.dump() << endl;

    return 0;
}