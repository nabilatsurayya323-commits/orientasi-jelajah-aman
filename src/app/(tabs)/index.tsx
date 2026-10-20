
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  HasilCuacaOffline,
  RingkasanKotaTersimpan,
} from "../../../types/cache";
import type { HasilGeocoding } from "../../../types/geocoding";

import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";

import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useDebounce } from "../../hooks/use-debounce";

import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { cariKota } from "../../services/geocodingService";
import { simpanRiwayat } from "../../services/riwayatStorage";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";

const WARNA = {
  biru: "#C4DAE8",
  kuning: "#FEEFB8",
  cokelat: "#432F2E",
  putih: "#FFFFFF",
  abu: "#777777",
  merah: "#B42318",
};

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] =
    useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] =
    useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);

  async function muatKotaTersimpan() {
    try {
      const data = await daftarKotaTersimpan();
      setKotaTersimpan(data);
    } catch (error) {
      console.error("Gagal memuat kota tersimpan:", error);
    }
  }

  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(() => muatKotaTersimpan())
      .catch((error) => {
        console.error("Gagal membersihkan cache:", error);
      });
  }, []);

  useEffect(() => {
    let masihAktif = true;

    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }

    cariKota(teksTertunda)
      .then((data) => {
        if (masihAktif) {
          setHasilPencarian(data);
        }
      })
      .catch(() => {
        if (masihAktif) {
          setHasilPencarian([]);
        }
      });

    return () => {
      masihAktif = false;
    };
  }, [teksTertunda]);

  async function pilihKota(
    kota: HasilGeocoding,
    paksaPerbarui = false,
  ) {
    setKotaTerpilih(kota);

    const idSaatIni = ++requestIdRef.current;

    setSedangMemuat(true);
    setPesanError(null);
    setPesanLokasi(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui },
      );

      if (idSaatIni !== requestIdRef.current) {
        return;
      }

      setHasil(data);

      // Simpan riwayat hanya untuk kota hasil pencarian,
      // bukan untuk pilihan "Lokasi Saat Ini".
      if (kota.id !== -1) {
        try {
          await simpanRiwayat(kota);
        } catch (error) {
          console.error("Gagal menyimpan riwayat pencarian:", error);
        }
      }

      if (idSaatIni === requestIdRef.current) {
        void muatKotaTersimpan();
      }
    } catch (error) {
      if (idSaatIni !== requestIdRef.current) {
        return;
      }

      console.error("Gagal memuat cuaca:", error);
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan koneksi internet tidak tersedia. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  async function gunakanLokasiSaatIni() {
    try {
      setPesanLokasi(null);

      const status = await mintaIzinLokasi();

      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual.",
        );
        return;
      }

      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak tersedia atau tidak aktif. Silakan cari kota secara manual.",
        );
        return;
      }

      const koordinat = await ambilKoordinatSaatIni();

      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch (error) {
      console.error("Gagal mengambil lokasi:", error);
      setPesanLokasi(
        "Lokasi gagal diperoleh. Periksa izin lokasi perangkat atau cari kota secara manual.",
      );
    }
  }

  function bukaFavorit() {
    if (!kotaTerpilih) {
      Alert.alert("Pilih kota", "Cari dan pilih kota terlebih dahulu.");
      return;
    }

    router.push({
      pathname: "/tambah-favorit",
      params: {
        id: String(kotaTerpilih.id),
        nama: kotaTerpilih.name,
        lat: String(kotaTerpilih.latitude),
        lon: String(kotaTerpilih.longitude),
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WARNA.putih }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: WARNA.cokelat,
          }}
        >
          Jelajah Aman
        </Text>

        <Text style={{ color: WARNA.abu }}>
          Cari kota untuk melihat informasi cuaca dan kualitas udara.
        </Text>

        <SearchBox onCari={setTeksCari} />

        <TouchableOpacity
          onPress={gunakanLokasiSaatIni}
          disabled={sedangMemuat}
          style={{
            backgroundColor: WARNA.kuning,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: WARNA.cokelat, fontWeight: "bold" }}>
            Gunakan Lokasi Saat Ini
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <Text style={{ color: WARNA.merah }}>{pesanLokasi}</Text>
        )}

        {hasilPencarian.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "bold", color: WARNA.cokelat }}>
              Hasil Pencarian
            </Text>

            {hasilPencarian.map((kota) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => void pilihKota(kota)}
                style={{
                  padding: 12,
                  backgroundColor: WARNA.biru,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ color: WARNA.cokelat, fontWeight: "600" }}
                >
                  {kota.name}
                </Text>
                {!!kota.country && (
                  <Text style={{ color: WARNA.cokelat, fontSize: 12 }}>
                    {kota.admin1 ? `${kota.admin1}, ` : ""}
                    {kota.country}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {teksTertunda.trim().length > 0 &&
          hasilPencarian.length === 0 && (
            <Text style={{ color: WARNA.abu }}>
              Tidak ada hasil kota atau pencarian belum selesai.
            </Text>
          )}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontWeight: "bold",
                color: WARNA.cokelat,
              }}
            >
              Tersimpan di Perangkat
            </Text>

            <Text style={{ fontSize: 12, color: WARNA.abu }}>
              Kota berikut dapat dicoba dibuka tanpa internet jika cache-nya
              masih tersedia.
            </Text>

            {kotaTersimpan.map((kota) => (
              <TouchableOpacity
                key={kota.kunci}
                onPress={() =>
                  void pilihKota({
                    id: kota.id,
                    name: kota.nama,
                    latitude: kota.latitude,
                    longitude: kota.longitude,
                    country: "",
                  })
                }
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: WARNA.biru,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: WARNA.cokelat }}>
                  {kota.nama}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && (
          <View style={{ alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="large" color={WARNA.cokelat} />
            <Text style={{ color: WARNA.abu }}>Memuat data cuaca...</Text>
          </View>
        )}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text style={{ color: WARNA.merah }}>{pesanError}</Text>
            <Button
              title="Coba Lagi"
              color={WARNA.cokelat}
              onPress={() => {
                if (kotaTerpilih) {
                  void pilihKota(kotaTerpilih, true);
                }
              }}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 12 }}>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(
                hasil.kualitasUdara.indeksAQI,
              )}
            />

            <Text style={{ color: WARNA.cokelat, fontSize: 13 }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
              {" • "}Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <TouchableOpacity
              onPress={() => void pilihKota(kotaTerpilih, true)}
              style={{
                backgroundColor: WARNA.biru,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: WARNA.cokelat, fontWeight: "bold" }}>
                Perbarui Sekarang
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={bukaFavorit}
              style={{
                backgroundColor: WARNA.kuning,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: WARNA.cokelat, fontWeight: "bold" }}>
                Tambahkan ke Favorit
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
