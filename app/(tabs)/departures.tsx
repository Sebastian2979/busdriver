import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RouteType = {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
};

type TripType = {
  trip_id: string;
  shape_id: string;
  direction_id: number;
  trip_headsign: string;
  start_name: string;
  end_name: string;
};

type DepartureType = {
  trip_id: string;
  departure_time: string;
};

export default function Departures() {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [search, setSearch] = useState("");

  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripType[]>([]);

  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [departures, setDepartures] = useState<DepartureType[]>([]);

  const [activeDepartureTrip, setActiveDepartureTrip] = useState<string | null>(null);
  const [stopTimes, setStopTimes] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://bus-backend-udbfqhu9.on-forge.com/api/routes")
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, []);

  const filteredRoutes = useMemo(() => {
    if (!search) return routes;

    return routes.filter((route) =>
      route.route_short_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, routes]);

  const loadTrips = async (line: string) => {
    try {
      const res = await fetch(
        `https://bus-backend-udbfqhu9.on-forge.com/api/trips/${line}`
      );

      const data = await res.json();
      setTrips(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLine = (line: string) => {
    if (expandedLine === line) {
      setExpandedLine(null);
      setTrips([]);
      return;
    }

    setExpandedLine(line);
    loadTrips(line);
  };

  const loadDepartures = async (tripId: string) => {
    try {
      const res = await fetch(
        `https://bus-backend-udbfqhu9.on-forge.com/api/departures/${tripId}`
      );

      const data = await res.json();

      console.log("departures:", data);

      setSelectedTrip(tripId);

      // FALL 1: Backend gibt direkt Array zurück
      if (Array.isArray(data)) {
        setDepartures(data);
      }

      // FALL 2: Backend gibt Objekt zurück
      else if (data.departures) {
        setDepartures(data.departures);
      } else if (data.next_departures) {
        setDepartures(data.next_departures);
      } else {
        setDepartures([]);
      }

      setStopTimes([]);
      setActiveDepartureTrip(null);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStopTimes = async (tripId: string) => {
    try {
      const res = await fetch(
        `https://bus-backend-udbfqhu9.on-forge.com/api/trips/${tripId}/stop-times`
      );

      const data = await res.json();

      setStopTimes(data);
      setActiveDepartureTrip(tripId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <BlurView intensity={70} tint="dark" style={styles.header}>
        <Text style={styles.title}>Linien</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Linie suchen..."
          placeholderTextColor="#aaa"
          style={styles.search}
        />
      </BlurView>

      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.route_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const line = item.route_short_name;
          const isOpen = expandedLine === line;

          return (
            <View>
              <Pressable
                onPress={() => toggleLine(line)}
                style={styles.card}
              >
                <Text style={styles.lineText}>Linie {line}</Text>
                <Text style={styles.subText}>{item.route_long_name}</Text>
              </Pressable>

              {isOpen &&
                trips.map((trip) => (
                  <View key={trip.trip_id}>
                    <Pressable
                      style={styles.tripCard}
                      onPress={() => loadDepartures(trip.trip_id)}
                    >
                      <Text style={styles.tripText}>{trip.start_name}</Text>
                      <Text style={styles.tripSub}>nach {trip.end_name}</Text>
                    </Pressable>

                    {selectedTrip === trip.trip_id &&
                      departures.length > 0 && (
                        <View style={styles.stopContainer}>
                          {departures.map((dep) => (
                            <Pressable
                              key={dep.trip_id}
                              style={styles.departureButton}
                              onPress={() => loadStopTimes(dep.trip_id)}
                            >
                              <Text style={styles.stopTime}>
                                {dep.departure_time.slice(0, 5)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}

                    {activeDepartureTrip && stopTimes.length > 0 && (
                      <View style={styles.stopContainer}>
                        {stopTimes.map((stop) => (
                          <View
                            key={`${activeDepartureTrip}-${stop.stop_sequence}`}
                            style={styles.stopRow}
                          >
                            <Text style={styles.stopName}>
                              {stop.stop_name}
                            </Text>

                            <Text style={styles.stopTime}>
                              {stop.departure_time?.slice(0, 5)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f1a" },
  header: {
    padding: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
  },
  search: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    borderRadius: 14,
    color: "white",
  },
  list: { padding: 10 },
  card: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  lineText: { fontSize: 18, fontWeight: "700", color: "white" },
  subText: { fontSize: 10, color: "#aaa", marginTop: 4 },
  tripCard: {
    marginLeft: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  tripText: { color: "white", fontSize: 14 },
  tripSub: { color: "#aaa", fontSize: 11, marginTop: 2 },
  stopContainer: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.2)",
  },
  departureButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  stopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  stopName: { color: "#ddd", fontSize: 12, flex: 1 },
  stopTime: {
    color: "#aaa",
    fontSize: 12,
    width: 60,
    textAlign: "right",
  },
});