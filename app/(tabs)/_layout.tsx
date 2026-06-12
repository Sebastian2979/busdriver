import { Tabs } from "expo-router";
import {
  Bus,
  CircleUserRound,
  Clock,
  House,
  Map
} from "lucide-react-native";
import { Dimensions, ImageBackground, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get('window');

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{uri: "https://images.pexels.com/photos/29036188/pexels-photo-29036188.jpeg"}}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <Tabs
          screenOptions={{
            headerShown: false,

            // HIER REIN: Löst das TypeScript-Problem und macht den Screen-Hintergrund transparent
            sceneStyle: { backgroundColor: "transparent" },

            tabBarStyle: {
              position: "absolute",
              bottom: 35,
              left: 24,
              right: 24,
              elevation: 0,
              backgroundColor: "#111827",
              borderRadius: 0,
              height: 75,
              borderTopWidth: 0,
              paddingBottom: 10,
              paddingTop: 10,
            },

            tabBarActiveTintColor: "#FFD800",
            tabBarInactiveTintColor: "#6B7280",

            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <House color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="map"
            options={{
              title: "Karte",
              tabBarIcon: ({ color, size }) => (
                <Map color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="lines"
            options={{
              title: "Linien",
              tabBarIcon: ({ color, size }) => (
                <Bus color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="departures"
            options={{
              title: "Abfahrten",
              tabBarIcon: ({ color, size }) => (
                <Clock color={color} size={size} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Profil",
              tabBarIcon: ({ color, size }) => (
                <CircleUserRound color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    width: width,
    height: height,
  },
});
