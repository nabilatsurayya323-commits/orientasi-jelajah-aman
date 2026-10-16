import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";

import type { KotaFavorit } from "../../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [sedangMenghapus, setSedangMenghapus] = useState<number | null>(null);

  const muatFavorit = useCallback(async () => {
    try {
      const data = await ambilSemuaFavorit();
      setDaftarFavorit(data);
    } catch (error) {
      console.error("Gagal mengambil favorit:", error);
      Alert.alert("Error", "Gagal memuat daftar kota favorit.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatFavorit();
    }, [muatFavorit]),
  );

  async function prosesHapus(kota: KotaFavorit) {
    if (sedangMenghapus !== null) return;

    try {
      setSedangMenghapus(kota.id);

      await hapusFavorit(kota.id);

      setDaftarFavorit((daftarLama) =>
        daftarLama.filter((item) => Number(item.id) !== Number(kota.id)),
      );

      Alert.alert("Berhasil", `${kota.nama} berhasil dihapus dari favorit.`);
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);

      Alert.alert("Gagal", "Kota tidak berhasil dihapus. Silakan coba lagi.");
    } finally {
      setSedangMenghapus(null);
    }
  }

  function konfirmasiHapus(kota: KotaFavorit) {
    Alert.alert("Konfirmasi Hapus", `Yakin hapus ${kota.nama} dari favorit?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void prosesHapus(kota);
        },
      },
    ]);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>

      <Text>Tersimpan {daftarFavorit.length} kota</Text>

      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}

      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 4,
          }}
        >
          <Text>{kota.nama}</Text>

          <Button
            title={sedangMenghapus === kota.id ? "Menghapus..." : "Hapus"}
            disabled={sedangMenghapus !== null}
            onPress={() => konfirmasiHapus(kota)}
          />
        </View>
      ))}
    </SafeAreaView>
  );
}
