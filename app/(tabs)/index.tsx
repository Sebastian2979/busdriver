import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const tiles = [
  { label: "Linien", route: "/lines" },
  { label: "Karte", route: "/map" },
  { label: "Abfahrten", route: "/departures" },
  { label: "Settings", route: "/profile" },
];

export default function HomeScreen() {
  return (
    <>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {tiles.map((tile) => (
            <Pressable key={tile.route} style={styles.tile} onPress={() => router.push(tile.route as any)}>
              <Text style={styles.text}>{tile.label}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "center",
    padding: 16,
  },

  tile: {
    width: "49%",
    height: "20%",
    backgroundColor: "#0f172a",
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    opacity: 0.7
  },

  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});