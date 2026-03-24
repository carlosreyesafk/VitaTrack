import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export function ClinicalMesh() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base Surface */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#f9f9fe" }]} />
      
      {/* Top Left Gradient (Blueish) */}
      <LinearGradient
        colors={["rgba(216, 226, 255, 0.4)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.4,
        }}
      />

      {/* Bottom Right Gradient (Greyish/Surface) */}
      <LinearGradient
        colors={["rgba(243, 243, 248, 1)", "transparent"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{
          position: "absolute",
          bottom: -width * 0.2,
          right: -width * 0.2,
          width: width,
          height: width,
          borderRadius: width * 0.5,
        }}
      />
    </View>
  );
}
