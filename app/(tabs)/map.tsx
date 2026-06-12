import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

type Stop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  shapeIndex?: number;
};

type ShapePoint = {
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const { shapeId, line, direction } = useLocalSearchParams<{
    shapeId: string;
    line?: string;
    direction?: string;
  }>();

  const mapRef = useRef<MapView>(null);

  const [shape, setShape] = useState<ShapePoint[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [nextStop, setNextStop] = useState<Stop | null>(null);
  const [currentShapeIndex, setCurrentShapeIndex] = useState<number | null>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);


  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("GPS permission denied");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (pos) => {
          console.log("GPS:", pos.coords.latitude, pos.coords.longitude);
          const { latitude, longitude } = pos.coords;

          setLocation({ latitude, longitude });
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * RESET + LOAD WHEN SHAPE CHANGES
   */
  useEffect(() => {
    if (!shapeId) return;

    console.log("MAP LOAD shapeId:", shapeId);

    setShape([]);
    setStops([]);

    /**
     * SHAPE LOAD
     */
    fetch(`https://bus-backend-udbfqhu9.on-forge.com/api/shapes/${shapeId}`)
      .then((res) => res.json())
      .then((data) => {
        setShape(data);

        setTimeout(() => {
          mapRef.current?.fitToCoordinates(data, {
            edgePadding: {
              top: 80,
              right: 80,
              bottom: 80,
              left: 80,
            },
            animated: true,
          });
        }, 50);
      });
  }, [shapeId]);

  useEffect(() => {
    if (!shapeId) return;

    console.log("MAP LOAD shapeId:", shapeId);

    setShape([]);
    setStops([]);

    /**
     * STOPS LOAD
     */
    fetch(`https://bus-backend-udbfqhu9.on-forge.com/api/shapes/${shapeId}/stops`)
      .then((res) => res.json())
      .then((data) => {
        setStops(data);

      });
  }, [shapeId]);

  useEffect(() => {
    if (shape.length === 0 || stops.length === 0) return;

    const mappedStops = stops.map((stop) => {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      shape.forEach((point, index) => {
        const distance = getDistanceMeters(
          stop.latitude,
          stop.longitude,
          point.latitude,
          point.longitude
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return {
        ...stop,
        shapeIndex: nearestIndex,
      };
    });

    setStops(mappedStops);
  }, [shape]);

  useEffect(() => {
    if (!location || stops.length === 0) return;

    let nearest = stops[0];
    let minDistance = Infinity;

    for (const stop of stops) {
      const distance = getDistanceMeters(
        location.latitude,
        location.longitude,
        stop.latitude,
        stop.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = stop;
      }
    }

    setNextStop(nearest);

  }, [location, stops]);

  useEffect(() => {
    if (!location || shape.length === 0) return;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    shape.forEach((point, index) => {
      const distance = getDistanceMeters(
        location.latitude,
        location.longitude,
        point.latitude,
        point.longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setCurrentShapeIndex(nearestIndex);

    console.log(
      "Bus bei Shape-Punkt:",
      nearestIndex,
      "Distanz:",
      Math.round(nearestDistance),
      "m"
    );
  }, [location, shape]);

  useEffect(() => {
    if (currentShapeIndex === null) return;

    const upcomingStop = stops.find(
      (stop) =>
        stop.shapeIndex !== undefined &&
        stop.shapeIndex > currentShapeIndex
    );

    if (upcomingStop) {
      setNextStop(upcomingStop);
    }
  }, [currentShapeIndex, stops]);

  const nextStopDistance =
    location && nextStop
      ? Math.round(
        getDistanceMeters(
          location.latitude,
          location.longitude,
          nextStop.latitude,
          nextStop.longitude
        )
      )
      : null;

  function getDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371000;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ padding: 10, fontWeight: "bold", marginTop: 20 }}>
        Linie {line} | Direction {direction} | Shape {shapeId} |
      </Text>

      {nextStop && (
        <View
          style={{
            backgroundColor: "white",
            padding: 10,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            Nächste Haltestelle
          </Text>

          <Text>{nextStop.name}</Text>

          <Text>{nextStopDistance} m</Text>
        </View>
      )}

      <MapView
        key={shapeId}
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 52.52,
          longitude: 13.405,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* SHAPE */}
        {shape.length > 1 && (
          <Polyline
            coordinates={shape}
            strokeWidth={5}
            strokeColor="#0000FF"
          />
        )}

        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: Number(stop.latitude),
              longitude: Number(stop.longitude),
            }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>🚏</Text>
              </View>
            </View>
          </Marker>
        ))}

        {location && (
          <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }} flat>
            <Image
              source={require("../../assets/images/bus.png")}
              style={{
                width: 24,
                height: 24,
              }}
              resizeMode="contain"
            />
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
  },

  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1976D2",
    elevation: 6,
  },

  iconText: {
    fontSize: 14,
  },
});