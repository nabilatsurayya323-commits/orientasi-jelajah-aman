import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Button, Platform, Text, View } from "react-native";

import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  async function simpan() {
    if (sedangMenyimpan) return;

    try {
      setSedangMenyimpan(true);

      await tambahFavorit({
        id: Number(id),
        nama: String(nama),
        latitude: Number(lat),
        longitude: Number(lon),
      });

      if (Platform.OS === "web") {
        router.dismissAll();
        router.replace("/");
      } else {
        Alert.alert("Berhasil", `${nama} ditambahkan ke favorit`, [
          {
            text: "OK",
            onPress: () => {
              router.dismissAll();
              router.replace("/");
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Gagal menyimpan favorit:", error);

      if (Platform.OS === "web") {
        window.alert("Kota tidak berhasil ditambahkan ke favorit.");
      } else {
        Alert.alert("Gagal", "Kota tidak berhasil ditambahkan ke favorit.");
      }
    } finally {
      setSedangMenyimpan(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text>Tambahkan {nama} ke daftar favorit?</Text>

      <Button
        title={sedangMenyimpan ? "Menyimpan..." : "Simpan"}
        onPress={simpan}
        disabled={sedangMenyimpan}
      />
    </View>
  );
}
