import { router } from "expo-router";
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const test = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Willkommen</Text>
            <Text style={styles.back} onPress={() => router.navigate('/')}>zurück zu Home</Text>
        </View>
    )
}

export default test

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b0f1a",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: "white",
        fontSize: 36,
    },
    back: {
        color: "blue",
        fontSize: 18,
        marginTop: 10
    }
})