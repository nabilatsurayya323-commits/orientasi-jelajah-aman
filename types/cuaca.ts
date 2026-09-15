// types/cuaca.ts

export type TingkatAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface DataCuaca {
  kota: string;
  suhu: number;
  kelembapan: number;
  catatan?: string;
}

export interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
}

export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: TingkatAQI;
  diperbaruiPada?: string;
}