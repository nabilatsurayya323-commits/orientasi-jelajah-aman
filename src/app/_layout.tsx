
import { Stack } from "expo-router";
import { ThemeProvider, useTema } from "../context/ThemeContext";

function RootNavigator() {
  const { warna } = useTema();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: warna.primary },
        headerTintColor: warna.text,
        headerTitleStyle: { color: warna.text, fontWeight: "bold" },
        contentStyle: { backgroundColor: warna.background },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="detail/[kota]"
        options={{ title: "Detail Cuaca" }}
      />

      <Stack.Screen
        name="tambah-favorit"
        options={{
          presentation: "modal",
          title: "Tambah Favorit",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
