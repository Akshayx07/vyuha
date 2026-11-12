#include <algorithm>
#include <cmath>
#include <iostream>
#include <iterator>
#include <limits>
#include <queue>
#include <string>
#include <utility>
#include <vector>

#include "json.hpp"

using json = nlohmann::json;

namespace {

constexpr double kPi = 3.14159265358979323846;
constexpr double kEarthRadiusKm = 6371.0088;
constexpr int kNearestNeighbors = 8;
constexpr int kGridSteps = 20;
constexpr double kCampMultiplier = 0.9;

double toRadians(double degrees) { return degrees * kPi / 180.0; }

double haversineKm(double lon1, double lat1, double lon2, double lat2) {
    const double deltaLat = toRadians(lat2 - lat1);
    const double deltaLon = toRadians(lon2 - lon1);
    const double a = std::sin(deltaLat / 2.0) * std::sin(deltaLat / 2.0) +
                     std::cos(toRadians(lat1)) * std::cos(toRadians(lat2)) *
                         std::sin(deltaLon / 2.0) * std::sin(deltaLon / 2.0);
    const double clamped = std::min(1.0, std::max(0.0, a));
    return 2.0 * kEarthRadiusKm * std::asin(std::sqrt(clamped));
}

double roundTo(double value, int decimals) {
    const double factor = std::pow(10.0, decimals);
    return std::round(value * factor) / factor;
}

struct Hazard {
    double longitude = 0.0;
    double latitude = 0.0;
    double radiusKm = 1.0;
    double multiplier = 1.0;
};

struct Node {
    double longitude = 0.0;
    double latitude = 0.0;
    bool isCamp = false;
};

struct Edge {
    int to = 0;
    double weight = 0.0;
};

bool isValidLongitudeLatitude(double longitude, double latitude) {
    return std::isfinite(longitude) && std::isfinite(latitude) &&
           longitude >= -180.0 && longitude <= 180.0 &&
           latitude >= -90.0 && latitude <= 90.0;
}

bool readCoordinates(const json& value, double& longitude, double& latitude) {
    if (value.is_array()) {
        if (value.size() < 2 || !value[0].is_number() || !value[1].is_number()) {
            return false;
        }

        longitude = value[0].get<double>();
        latitude = value[1].get<double>();

        return isValidLongitudeLatitude(longitude, latitude);
    }

    if (value.is_object()) {
        if (value.contains("coordinates")) {
            return readCoordinates(value["coordinates"], longitude, latitude);
        }
        if (value.contains("location")) {
            return readCoordinates(value["location"], longitude, latitude);
        }
    }

    return false;
}

bool defaultPenalty(const std::string& severity, double& radiusKm,
                    double& multiplier) {
    if (severity == "Low") {
        radiusKm = 0.5;
        multiplier = 1.5;
        return true;
    }
    if (severity == "Medium") {
        radiusKm = 1.0;
        multiplier = 3.0;
        return true;
    }
    if (severity == "High") {
        radiusKm = 2.0;
        multiplier = 10.0;
        return true;
    }

    return false;
}

std::vector<Hazard> parseHazards(const json& payload) {
    std::vector<Hazard> hazards;

    if (!payload.contains("hazards") || !payload["hazards"].is_array()) {
        return hazards;
    }

    int index = 0;
    for (const auto& entry : payload["hazards"]) {
        Hazard hazard;

        if (!readCoordinates(entry, hazard.longitude, hazard.latitude)) {
            std::cerr << "engine: skipping hazard " << index
                      << " with invalid location" << std::endl;
            ++index;
            continue;
        }

        std::string severity = "Medium";
        if (entry.is_object() && entry.contains("severity") &&
            entry["severity"].is_string()) {
            severity = entry["severity"].get<std::string>();
        }

        if (!defaultPenalty(severity, hazard.radiusKm, hazard.multiplier)) {
            std::cerr << "engine: unknown severity '" << severity
                      << "' on hazard " << index << ", using Medium penalties"
                      << std::endl;
            defaultPenalty("Medium", hazard.radiusKm, hazard.multiplier);
        }

        // A hazard may provide its own radius in kilometres.
        if (entry.is_object() && entry.contains("radius") &&
            entry["radius"].is_number()) {
            const double radius = entry["radius"].get<double>();
            if (std::isfinite(radius) && radius > 0.0) {
                hazard.radiusKm = radius;
            }
        }

        hazards.push_back(hazard);
        ++index;
    }

    return hazards;
}

std::vector<Node> parseCamps(const json& payload) {
    std::vector<Node> camps;

    if (!payload.contains("camps") || !payload["camps"].is_array()) {
        return camps;
    }

    int index = 0;
    for (const auto& entry : payload["camps"]) {
        Node camp;
        camp.isCamp = true;

        if (!readCoordinates(entry, camp.longitude, camp.latitude)) {
            std::cerr << "engine: skipping camp " << index
                      << " with invalid location" << std::endl;
            ++index;
            continue;
        }

        camps.push_back(camp);
        ++index;
    }

    return camps;
}

double hazardMultiplierAt(double longitude, double latitude,
                          const std::vector<Hazard>& hazards) {
    double multiplier = 1.0;

    for (const auto& hazard : hazards) {
        const double distance = haversineKm(longitude, latitude, hazard.longitude,
                                            hazard.latitude);
        if (distance <= hazard.radiusKm) {
            multiplier = std::max(multiplier, hazard.multiplier);
        }
    }

    return multiplier;
}

// Hazards never make an edge impassable; they only increase its cost. The
// strongest penalty touching the edge wins so overlapping hazards do not
// multiply into absurd weights.
double edgeWeight(const Node& from, const Node& to,
                  const std::vector<Hazard>& hazards) {
    const double distance =
        haversineKm(from.longitude, from.latitude, to.longitude, to.latitude);

    if (distance <= 0.0) {
        return 0.0;
    }

    const double midpointLongitude = (from.longitude + to.longitude) / 2.0;
    const double midpointLatitude = (from.latitude + to.latitude) / 2.0;

    double multiplier =
        hazardMultiplierAt(from.longitude, from.latitude, hazards);
    multiplier = std::max(
        multiplier, hazardMultiplierAt(to.longitude, to.latitude, hazards));
    multiplier = std::max(
        multiplier,
        hazardMultiplierAt(midpointLongitude, midpointLatitude, hazards));

    if (from.isCamp || to.isCamp) {
        multiplier *= kCampMultiplier;
    }

    return distance * multiplier;
}

int addNode(std::vector<Node>& nodes, double longitude, double latitude,
            bool isCamp) {
    for (std::size_t index = 0; index < nodes.size(); ++index) {
        if (std::fabs(nodes[index].longitude - longitude) < 1e-9 &&
            std::fabs(nodes[index].latitude - latitude) < 1e-9) {
            if (isCamp) {
                nodes[index].isCamp = true;
            }
            return static_cast<int>(index);
        }
    }

    nodes.push_back({longitude, latitude, isCamp});
    return static_cast<int>(nodes.size()) - 1;
}

}  // namespace

int main() {
    const std::string raw((std::istreambuf_iterator<char>(std::cin)),
                          std::istreambuf_iterator<char>());

    if (raw.find_first_not_of(" \t\r\n") == std::string::npos) {
        std::cerr << "engine: no request received on standard input"
                  << std::endl;
        return 1;
    }

    json request;
    try {
        request = json::parse(raw);
    } catch (const std::exception& error) {
        std::cerr << "engine: malformed JSON request: " << error.what()
                  << std::endl;
        return 1;
    }

    if (!request.is_object()) {
        std::cerr << "engine: request must be a JSON object" << std::endl;
        return 1;
    }

    std::string requestId;
    if (request.contains("requestId") && request["requestId"].is_string()) {
        requestId = request["requestId"].get<std::string>();
    }

    if (!request.contains("action") || !request["action"].is_string() ||
        request["action"].get<std::string>() != "calculateDistance") {
        std::cerr << "engine: unsupported action, expected calculateDistance"
                  << std::endl;
        return 1;
    }

    if (!request.contains("payload") || !request["payload"].is_object()) {
        std::cerr << "engine: payload object is required" << std::endl;
        return 1;
    }

    const json& payload = request["payload"];

    double originLongitude = 0.0;
    double originLatitude = 0.0;
    if (!payload.contains("origin") ||
        !readCoordinates(payload["origin"], originLongitude, originLatitude)) {
        std::cerr << "engine: payload.origin.coordinates is invalid"
                  << std::endl;
        return 1;
    }

    double destinationLongitude = 0.0;
    double destinationLatitude = 0.0;
    if (!payload.contains("destination") ||
        !readCoordinates(payload["destination"], destinationLongitude,
                         destinationLatitude)) {
        std::cerr << "engine: payload.destination.coordinates is invalid"
                  << std::endl;
        return 1;
    }

    const std::vector<Hazard> hazards = parseHazards(payload);
    const std::vector<Node> camps = parseCamps(payload);

    // Bounding box of the route, with a margin so the grid allows detours.
    double minLongitude = std::min(originLongitude, destinationLongitude);
    double maxLongitude = std::max(originLongitude, destinationLongitude);
    double minLatitude = std::min(originLatitude, destinationLatitude);
    double maxLatitude = std::max(originLatitude, destinationLatitude);

    for (const auto& camp : camps) {
        minLongitude = std::min(minLongitude, camp.longitude);
        maxLongitude = std::max(maxLongitude, camp.longitude);
        minLatitude = std::min(minLatitude, camp.latitude);
        maxLatitude = std::max(maxLatitude, camp.latitude);
    }

    const double minimumSpan = 0.01;  // degrees, roughly one kilometre
    const double marginLongitude =
        std::max((maxLongitude - minLongitude) * 0.1, minimumSpan);
    const double marginLatitude =
        std::max((maxLatitude - minLatitude) * 0.1, minimumSpan);

    minLongitude = std::max(-180.0, minLongitude - marginLongitude);
    maxLongitude = std::min(180.0, maxLongitude + marginLongitude);
    minLatitude = std::max(-90.0, minLatitude - marginLatitude);
    maxLatitude = std::min(90.0, maxLatitude + marginLatitude);

    const double middleLatitude = (minLatitude + maxLatitude) / 2.0;
    const double kmPerDegreeLatitude = 111.32;
    const double kmPerDegreeLongitude =
        std::max(1e-6, 111.32 * std::cos(toRadians(middleLatitude)));

    const double widthKm = (maxLongitude - minLongitude) * kmPerDegreeLongitude;
    const double heightKm = (maxLatitude - minLatitude) * kmPerDegreeLatitude;
    double cellKm = std::max(widthKm, heightKm) / kGridSteps;
    if (!(cellKm > 0.0) || !std::isfinite(cellKm)) {
        cellKm = 1.0;
    }

    const int columns =
        std::max(1, static_cast<int>(std::ceil(widthKm / cellKm)));
    const int rows = std::max(1, static_cast<int>(std::ceil(heightKm / cellKm)));

    std::vector<Node> nodes;
    nodes.reserve(static_cast<std::size_t>(rows + 1) * (columns + 1) +
                  camps.size() + 2);

    for (int row = 0; row <= rows; ++row) {
        const double latitude =
            minLatitude + (maxLatitude - minLatitude) * row / rows;
        for (int column = 0; column <= columns; ++column) {
            const double longitude =
                minLongitude + (maxLongitude - minLongitude) * column / columns;
            addNode(nodes, longitude, latitude, false);
        }
    }

    const int originNode =
        addNode(nodes, originLongitude, originLatitude, false);
    const int destinationNode =
        addNode(nodes, destinationLongitude, destinationLatitude, false);
    for (const auto& camp : camps) {
        addNode(nodes, camp.longitude, camp.latitude, true);
    }

    // Connect every node to its nearest neighbours; edges are always passable.
    std::vector<std::vector<Edge>> graph(nodes.size());
    std::vector<std::pair<double, int>> candidates;

    for (std::size_t i = 0; i < nodes.size(); ++i) {
        candidates.clear();
        candidates.reserve(nodes.size());

        for (std::size_t j = 0; j < nodes.size(); ++j) {
            if (i == j) {
                continue;
            }

            candidates.emplace_back(
                haversineKm(nodes[i].longitude, nodes[i].latitude,
                            nodes[j].longitude, nodes[j].latitude),
                static_cast<int>(j));
        }

        const std::size_t keep =
            std::min<std::size_t>(kNearestNeighbors, candidates.size());
        std::partial_sort(candidates.begin(), candidates.begin() + keep,
                          candidates.end());

        for (std::size_t k = 0; k < keep; ++k) {
            const int neighbour = candidates[k].second;
            const double weight = edgeWeight(nodes[i], nodes[neighbour], hazards);
            graph[i].push_back({neighbour, weight});
            graph[neighbour].push_back({static_cast<int>(i), weight});
        }
    }

    const double infinity = std::numeric_limits<double>::infinity();
    std::vector<double> cost(nodes.size(), infinity);
    std::vector<int> previous(nodes.size(), -1);
    using QueueEntry = std::pair<double, int>;
    std::priority_queue<QueueEntry, std::vector<QueueEntry>,
                        std::greater<QueueEntry>>
        queue;

    cost[originNode] = 0.0;
    queue.push({0.0, originNode});

    while (!queue.empty()) {
        const auto [currentCost, current] = queue.top();
        queue.pop();

        if (currentCost > cost[current]) {
            continue;
        }
        if (current == destinationNode) {
            break;
        }

        for (const auto& edge : graph[current]) {
            const double nextCost = currentCost + edge.weight;
            if (nextCost < cost[edge.to]) {
                cost[edge.to] = nextCost;
                previous[edge.to] = current;
                queue.push({nextCost, edge.to});
            }
        }
    }

    if (!std::isfinite(cost[destinationNode])) {
        std::cerr << "engine: destination is unreachable from origin"
                  << std::endl;
        return 1;
    }

    std::vector<int> route;
    for (int current = destinationNode; current != -1;
         current = previous[current]) {
        route.push_back(current);
        if (current == originNode) {
            break;
        }
    }
    std::reverse(route.begin(), route.end());

    if (route.empty() || route.front() != originNode) {
        std::cerr << "engine: failed to reconstruct the route" << std::endl;
        return 1;
    }

    // Report the geometric length of the chosen route in kilometres.
    double distanceKm = 0.0;
    for (std::size_t i = 1; i < route.size(); ++i) {
        distanceKm += haversineKm(nodes[route[i - 1]].longitude,
                                  nodes[route[i - 1]].latitude,
                                  nodes[route[i]].longitude,
                                  nodes[route[i]].latitude);
    }

    json output;
    output["requestId"] = requestId;
    output["distanceKm"] = roundTo(distanceKm, 3);
    output["path"] = json::array();
    for (const int nodeIndex : route) {
        output["path"].push_back(json::array(
            {roundTo(nodes[nodeIndex].longitude, 6),
             roundTo(nodes[nodeIndex].latitude, 6)}));
    }
    output["hazardsConsidered"] = hazards.size();
    output["campsConsidered"] = camps.size();

    std::cout << output.dump() << std::endl;

    return 0;
}
