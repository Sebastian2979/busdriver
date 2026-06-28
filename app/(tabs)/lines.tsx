import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
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

export default function LinesScreen() {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [search, setSearch] = useState("");

  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripType[]>([]);

  useEffect(() => {
    fetch("https://bus-backend-udbfqhu9.on-forge.com/api/routes")
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, []);

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

  const filteredRoutes = useMemo(() => {
    if (!search) return routes;
    return routes.filter((item) =>
      item.route_short_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, routes]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
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

      {/* LIST */}
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.route_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const line = item.route_short_name;
          const isOpen = expandedLine === line;

          return (
            <View>
              {/* LINE CARD */}
              <Pressable
                key={line}
                onPress={() => toggleLine(line)}
                style={styles.card}
              >
                <Text style={styles.lineText}>
                  Linie {line}
                </Text>

                <Text style={styles.subText} numberOfLines={1}>
                  {item.route_long_name}
                </Text>
              </Pressable>

              {/* TRIPS */}
              {isOpen &&
                trips.map((trip) => (
                  <Pressable
                    key={trip.trip_id}
                    onPress={() => {
                      console.log(trip)
                      router.push({
                        pathname: "/map",
                        params: {
                          shapeId: trip.shape_id,
                          line: line,
                          direction: String(trip.direction_id),
                        },
                      })
                    }

                    }
                    style={styles.tripCard}
                  >
                    <Text style={styles.tripText}>
                      {trip.start_name}
                    </Text>

                    <Text style={styles.tripSub}>
                      nach {trip.end_name}
                    </Text>
                  </Pressable>
                ))}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
  },

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

  list: {
    padding: 10,
  },

  card: {
    marginBottom: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  lineText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },

  subText: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
  },

  tripCard: {
    marginLeft: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  tripText: {
    color: "white",
    fontSize: 14,
  },

  tripSub: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
  },
});