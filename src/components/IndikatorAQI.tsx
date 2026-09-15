import type { LaporanUdara, TingkatAQI } from "../../types/cuaca";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

// Menggunakan Record untuk tipe objek warna yang presisi
const warna: Record<TingkatAQI, string> = {
  BAIK: "green",
  SEDANG: "orange",
  TIDAK_SEHAT: "red",
  BERBAHAYA: "darkred",
};

export default function IndikatorAQI({ data }: IndikatorAQIProps) {
  return (
    <div>
      <p>
        Kualitas udara di {data.kota}:{" "}
        <span style={{ color: warna[data.tingkat] }}>
          {data.tingkat}
        </span>
      </p>

      <p>Indeks AQI: {data.indeksAQI}</p>

      {data.diperbaruiPada && (
        <p>Diperbarui pada: {data.diperbaruiPada}</p>
      )}
    </div>
  );
}