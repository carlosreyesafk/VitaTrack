import { Tabs } from "expo-router";
import { LayoutDashboard, Users, Bell, User } from "lucide-react-native";

export default function DoctorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0058bc",
        tabBarInactiveTintColor: "#717786",
        tabBarStyle: {
          backgroundColor: "rgba(249,249,254,0.92)",
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Panel",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pacientes"
        options={{
          title: "Pacientes",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
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
