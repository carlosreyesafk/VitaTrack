import { Tabs } from "expo-router";
import { Home, Pill, Activity, Bell, User } from "lucide-react-native";

export default function PatientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0058bc",
        tabBarInactiveTintColor: "#717786",
        tabBarStyle: {
          backgroundColor: "rgba(249,249,254,0.92)",
          borderTopWidth: 0,
          elevation: 0,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="medicamentos"
        options={{
          title: "Medicamentos",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sintomas"
        options={{
          title: "Síntomas",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
