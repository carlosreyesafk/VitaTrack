import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

export default function PatientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0058bc",
        tabBarInactiveTintColor: "#717786",
        tabBarStyle: {
          backgroundColor: "#f9f9fe",
          borderTopWidth: 0,
          elevation: 10,
          height: 84,
          paddingBottom: 24,
          paddingTop: 8,
          shadowColor: "#1a1c1f",
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        tabBarLabelStyle: { 
          fontFamily: "Inter_600SemiBold", 
          fontSize: 10,
          marginTop: -4
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="medicamentos"
        options={{
          title: "Medicina",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "pill" : "pill"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sintomas"
        options={{
          title: "Evolución",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "chart-timeline-variant" : "chart-timeline-variant"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "bell" : "bell-outline"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "account" : "account-outline"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
