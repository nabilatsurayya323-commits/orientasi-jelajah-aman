import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KotaFavorit } from "../../types/favorit";

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit";

export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> {
  const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);

  if (!json) {
    return [];
  }

  try {
    return JSON.parse(json) as KotaFavorit[];
  } catch {
    throw new Error("Data favorit tidak dapat dibaca.");
  }
}

export async function tambahFavorit(kota: KotaFavorit): Promise<void> {
  const daftar = await ambilSemuaFavorit();

  const sudahAda = daftar.some((item) => Number(item.id) === Number(kota.id));

  if (sudahAda) {
    return;
  }

  await AsyncStorage.setItem(
    KUNCI_PENYIMPANAN,
    JSON.stringify([...daftar, kota]),
  );
}

export async function hapusFavorit(id: number): Promise<void> {
  const daftar = await ambilSemuaFavorit();

  const daftarBaru = daftar.filter((kota) => Number(kota.id) !== Number(id));

  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));

  // Pastikan perubahan sudah tersimpan.
  const hasilSimpan = await ambilSemuaFavorit();

  if (hasilSimpan.some((kota) => Number(kota.id) === Number(id))) {
    throw new Error("Favorit gagal dihapus dari penyimpanan.");
  }
}
