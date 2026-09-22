import { useEffect, useState } from "react";
import { View } from "react-native";

// Catatan: gunakan ../components/ jika file berada di dalam folder app/
// yang sejajar dengan folder components/
import IndikatorAQI from "../../../components/IndikatorAQI";
import RiwayatList from "../../../components/RiwayatList";
import SearchBox from "../../../components/SearchBox";
import WeatherCard from "../../../components/WeatherCard";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);
  // Tambahkan useEffect untuk mencatat perubahan kota aktif
  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);
  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }
  const laporanUdara = {
    kota: kotaAktif,
    indeksAQI: 42,
    tingkat: "BAIK" as const,
    diperbaruiPada: "15 September 2026",
  };
  return (
    <View style={{ padding: 16, paddingTop: 50, gap: 16 }}>
      <SearchBox onCari={handleCari} />

      <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />

      <IndikatorAQI
        kota={laporanUdara.kota}
        indeksAQI={laporanUdara.indeksAQI}
        tingkat={laporanUdara.tingkat}
        diperbaruiPada={laporanUdara.diperbaruiPada}
      />

      <RiwayatList daftarKota={riwayat} />
    </View>
  );
}
