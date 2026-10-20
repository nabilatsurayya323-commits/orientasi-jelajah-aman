
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTema, type Tema } from "../../context/ThemeContext";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
  const { tema, warna, ubahTema, sedangMemuatTema } = useTema();
  const [pesan, setPesan] = useState<string | null>(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);

  async function pilihTema(temaBaru: Tema) {
    try {
      await ubahTema(temaBaru);
      setPesan(
        `Mode ${temaBaru === "terang" ? "terang" : "gelap"} berhasil diterapkan.`,
      );
    } catch {
      tampilkanPesan(
        "Gagal",
        "Pilihan tema tidak berhasil disimpan. Silakan coba lagi.",
      );
    }
  }

  function tampilkanPesan(judul: string, isi: string) {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.alert(`${judul}\n\n${isi}`);
    } else {
      Alert.alert(judul, isi);
    }
  }

  async function hapusDataTersimpan() {
    if (sedangMenghapus) return;

    setSedangMenghapus(true);
    setPesan(null);

    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan sudah dihapus.");
    } catch (error) {
      console.error("Gagal menghapus cache:", error);
      tampilkanPesan(
        "Gagal",
        "Data cuaca tersimpan tidak berhasil dihapus.",
      );
    } finally {
      setSedangMenghapus(false);
    }
  }

  const gelap = tema === "gelap";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: warna.background }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heading}>
          <View
            style={[
              styles.logo,
              { backgroundColor: warna.primary },
            ]}
          >
            <Ionicons
              name="compass-outline"
              size={30}
              color={warna.text}
            />
          </View>

          <Text style={[styles.judul, { color: warna.text }]}>
            Pengaturan
          </Text>
          <Text style={[styles.deskripsi, { color: warna.textSecondary }]}>
            Sesuaikan tampilan Jelajah Aman dengan preferensimu.
          </Text>
        </View>

        <View
          style={[
            styles.kartu,
            {
              backgroundColor: warna.surface,
              borderColor: warna.border,
            },
          ]}
        >
          <View style={styles.judulKartu}>
            <Ionicons name="color-palette-outline" size={23} color={warna.text} />
            <Text style={[styles.judulBagian, { color: warna.text }]}>
              Tampilan
            </Text>
          </View>

          <Text style={[styles.deskripsi, { color: warna.textSecondary }]}>
            Pilih tema yang nyaman digunakan.
          </Text>

          {sedangMemuatTema ? (
            <ActivityIndicator color={warna.text} style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.pilihanTema}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Gunakan mode terang"
                accessibilityState={{ selected: tema === "terang" }}
                onPress={() => void pilihTema("terang")}
                style={[
                  styles.tombolTema,
                  {
                    backgroundColor:
                      tema === "terang" ? warna.primary : warna.background,
                    borderColor:
                      tema === "terang" ? warna.text : warna.border,
                  },
                ]}
              >
                <Ionicons
                  name="sunny-outline"
                  size={28}
                  color={warna.text}
                />
                <Text style={[styles.teksTema, { color: warna.text }]}>
                  Terang
                </Text>
                {tema === "terang" && (
                  <Ionicons name="checkmark-circle" size={20} color={warna.text} />
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Gunakan mode gelap"
                accessibilityState={{ selected: tema === "gelap" }}
                onPress={() => void pilihTema("gelap")}
                style={[
                  styles.tombolTema,
                  {
                    backgroundColor:
                      tema === "gelap" ? warna.primary : warna.background,
                    borderColor:
                      tema === "gelap" ? warna.text : warna.border,
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={28}
                  color={warna.text}
                />
                <Text style={[styles.teksTema, { color: warna.text }]}>
                  Gelap
                </Text>
                {tema === "gelap" && (
                  <Ionicons name="checkmark-circle" size={20} color={warna.text} />
                )}
              </Pressable>
            </View>
          )}

          {pesan && (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.pesan, { color: warna.text }]}
            >
              {pesan}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.kartu,
            {
              backgroundColor: warna.surface,
              borderColor: warna.border,
            },
          ]}
        >
          <View style={styles.judulKartu}>
            <Ionicons
              name="cloud-download-outline"
              size={23}
              color={warna.text}
            />
            <Text style={[styles.judulBagian, { color: warna.text }]}>
              Penyimpanan
            </Text>
          </View>

          <Text style={[styles.deskripsi, { color: warna.textSecondary }]}>
            Hapus data cuaca yang tersimpan di perangkat.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={sedangMenghapus}
            onPress={() => void hapusDataTersimpan()}
            style={[
              styles.tombolHapus,
              {
                backgroundColor: gelap ? "#512C31" : "#FCE8E6",
                borderColor: warna.danger,
                opacity: sedangMenghapus ? 0.6 : 1,
              },
            ]}
          >
            {sedangMenghapus ? (
              <ActivityIndicator color={warna.danger} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={warna.danger} />
            )}
            <Text style={[styles.teksHapus, { color: warna.danger }]}>
              {sedangMenghapus ? "Menghapus..." : "Hapus Data Cuaca Tersimpan"}
            </Text>
          </Pressable>

          {pesan === "Data cuaca tersimpan sudah dihapus." && (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.pesan, { color: warna.text }]}
            >
              {pesan}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.namaAplikasi, { color: warna.text }]}>
            Jelajah Aman
          </Text>
          <Text style={[styles.deskripsi, { color: warna.textSecondary }]}>
            Versi 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 18,
    paddingBottom: 32,
  },
  heading: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  judul: {
    fontSize: 25,
    fontWeight: "bold",
  },
  deskripsi: {
    fontSize: 14,
    lineHeight: 21,
  },
  kartu: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
    gap: 12,
  },
  judulKartu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  judulBagian: {
    fontSize: 17,
    fontWeight: "bold",
  },
  pilihanTema: {
    flexDirection: "row",
    gap: 12,
    marginTop: 5,
  },
  tombolTema: {
    flex: 1,
    minHeight: 108,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
  },
  teksTema: {
    fontSize: 15,
    fontWeight: "600",
  },
  pesan: {
    fontSize: 13,
    lineHeight: 19,
  },
  tombolHapus: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  teksHapus: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    gap: 5,
    paddingTop: 8,
  },
  namaAplikasi: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
