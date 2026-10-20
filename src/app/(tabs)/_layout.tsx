
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTema } from "../../context/ThemeContext";

export default function TabLayout() {
  const { warna } = useTema();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: warna.primary,
        },
        headerTintColor: warna.text,
        headerTitleStyle: {
          fontWeight: "bold",
          color: warna.text,
        },
        tabBarActiveTintColor: warna.text,
        tabBarInactiveTintColor: warna.tabInactive,
        tabBarStyle: {
          backgroundColor: warna.primary,
          borderTopColor: warna.secondary,
          borderTopWidth: 2,
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat Pencarian",
          tabBarLabel: "Riwayat",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "information-circle"
                  : "information-circle-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
