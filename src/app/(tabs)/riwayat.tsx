import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { ambilRiwayat, hapusRiwayat } from "../../services/riwayatStorage";

import type { KotaFavorit } from "../../../types/favorit";
import type { HasilGeocoding } from "../../../types/geocoding";

const WARNA = {
  biru: "#C4DAE8",
  kuning: "#FEEFB8",
  cokelat: "#432F2E",
  putih: "#FFFFFF",
  abu: "#777777",
  merah: "#B42318",
};

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<HasilGeocoding[]>([]);
  const [sedangMenghapus, setSedangMenghapus] = useState<number | null>(null);
  const [sedangMenghapusRiwayat, setSedangMenghapusRiwayat] = useState(false);

  const muatData = useCallback(async () => {
    try {
      const [favorit, riwayat] = await Promise.all([
        ambilSemuaFavorit(),
        ambilRiwayat(),
      ]);

      setDaftarFavorit(favorit);
      setDaftarRiwayat(riwayat.slice(0, 10));
    } catch (error) {
      console.error("Gagal memuat data riwayat:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void muatData();
    }, [muatData]),
  );

  function bukaKota(kota: HasilGeocoding) {
    router.navigate({
      pathname: "/",
      params: {
        kotaId: String(kota.id),
        namaKota: kota.name,
        latitude: String(kota.latitude),
        longitude: String(kota.longitude),
      },
    });
  }

  async function prosesHapusFavorit(kota: KotaFavorit) {
    if (sedangMenghapus !== null) return;

    setSedangMenghapus(Number(kota.id));

    try {
      await hapusFavorit(Number(kota.id));

      const dataTerbaru = await ambilSemuaFavorit();
      setDaftarFavorit(dataTerbaru);

      tampilkanPesan("Berhasil", `${kota.nama} berhasil dihapus dari favorit.`);
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);
      tampilkanPesan(
        "Gagal",
        error instanceof Error
          ? error.message
          : "Kota favorit tidak berhasil dihapus.",
      );
    } finally {
      setSedangMenghapus(null);
    }
  }

  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(
        `Yakin ingin menghapus ${kota.nama} dari favorit?`,
      );

      if (yakin) {
        void prosesHapusFavorit(kota);
      }

      return;
    }

    Alert.alert(
      "Konfirmasi Hapus",
      `Yakin ingin menghapus ${kota.nama} dari favorit?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            void prosesHapusFavorit(kota);
          },
        },
      ],
    );
  }

  async function prosesHapusRiwayat() {
    if (sedangMenghapusRiwayat) return;

    try {
      setSedangMenghapusRiwayat(true);
      await hapusRiwayat();
      setDaftarRiwayat([]);
      tampilkanPesan("Berhasil", "Riwayat pencarian berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus riwayat:", error);
      tampilkanPesan("Gagal", "Riwayat pencarian tidak berhasil dihapus.");
    } finally {
      setSedangMenghapusRiwayat(false);
    }
  }

  function konfirmasiHapusRiwayat() {
    if (daftarRiwayat.length === 0) return;

    if (Platform.OS === "web") {
      if (window.confirm("Hapus semua riwayat pencarian?")) {
        void prosesHapusRiwayat();
      }
      return;
    }

    Alert.alert(
      "Hapus Riwayat",
      "Yakin ingin menghapus semua riwayat pencarian?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => void prosesHapusRiwayat(),
        },
      ],
    );
  }

  function tampilkanPesan(judul: string, pesan: string) {
    if (Platform.OS === "web") {
      window.alert(`${judul}\n${pesan}`);
    } else {
      Alert.alert(judul, pesan);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARNA.putih }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {/* RIWAYAT PENCARIAN */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: WARNA.cokelat,
            }}
          >
            Riwayat Pencarian
          </Text>

          <Text style={{ color: WARNA.abu }}>
            Maksimal 10 kota terakhir yang berhasil dimuat.
          </Text>

          {daftarRiwayat.length === 0 ? (
            <View
              style={{
                padding: 16,
                backgroundColor: WARNA.biru,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: WARNA.cokelat }}>
                Belum ada riwayat pencarian. Cari dan pilih kota dari halaman
                Beranda terlebih dahulu.
              </Text>
            </View>
          ) : (
            <>
              {daftarRiwayat.map((kota, index) => (
                <TouchableOpacity
                  key={`${kota.id}-${index}`}
                  onPress={() => bukaKota(kota)}
                  style={{
                    padding: 14,
                    backgroundColor: WARNA.biru,
                    borderRadius: 12,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Buka cuaca ${kota.name}`}
                >
                  <Text
                    style={{
                      color: WARNA.cokelat,
                      fontWeight: "bold",
                    }}
                  >
                    {kota.name}
                  </Text>

                  <Text style={{ color: WARNA.cokelat, fontSize: 12 }}>
                    {kota.admin1 ? `${kota.admin1}, ` : ""}
                    {kota.country}
                  </Text>

                  <Text
                    style={{
                      color: WARNA.cokelat,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Ketuk untuk membuka kota
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={konfirmasiHapusRiwayat}
                disabled={sedangMenghapusRiwayat}
                style={{
                  backgroundColor: WARNA.kuning,
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  opacity: sedangMenghapusRiwayat ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    color: WARNA.cokelat,
                    fontWeight: "bold",
                  }}
                >
                  {sedangMenghapusRiwayat
                    ? "Menghapus..."
                    : "Hapus Semua Riwayat"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: WARNA.biru,
          }}
        />

        {/* KOTA FAVORIT */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: WARNA.cokelat,
            }}
          >
            Kota Favorit
          </Text>

          <Text style={{ color: WARNA.abu }}>
            Tersimpan {daftarFavorit.length} kota favorit.
          </Text>

          {daftarFavorit.length === 0 ? (
            <Text style={{ color: WARNA.abu }}>Belum ada kota favorit.</Text>
          ) : (
            daftarFavorit.map((kota) => (
              <View
                key={kota.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: WARNA.biru,
                  borderRadius: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: WARNA.cokelat,
                      fontWeight: "bold",
                    }}
                  >
                    {kota.nama}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => konfirmasiHapusFavorit(kota)}
                  disabled={sedangMenghapus !== null}
                  style={{
                    backgroundColor: WARNA.kuning,
                    paddingVertical: 9,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    opacity: sedangMenghapus !== null ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: WARNA.cokelat, fontWeight: "bold" }}>
                    {sedangMenghapus === kota.id ? "Menghapus..." : "Hapus"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
