export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  diperbaruiPada?: string;
}

export type IndikatorAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface IndikatorAQIProps {
  kota: string;
  indeksAQI: number;
  tingkat: IndikatorAQI;
  diperbaruiPada?: string;
}
