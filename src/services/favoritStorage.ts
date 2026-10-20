import AsyncStorage from "@react-native-async-storage/async-storage";
import type { KotaFavorit } from "../../types/favorit";

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit";

export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);

    if (!json) {
      return [];
    }

    const data: unknown = JSON.parse(json);

    if (!Array.isArray(data)) {
      return [];
    }

    return data as KotaFavorit[];
  } catch (error) {
    console.error("Gagal membaca favorit:", error);
    throw error;
  }
}

export async function tambahFavorit(kota: KotaFavorit): Promise<void> {
  const daftar = await ambilSemuaFavorit();

  const sudahAda = daftar.some(
    (item) => Number(item.id) === Number(kota.id),
  );

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

  const daftarBaru = daftar.filter(
    (kota) => Number(kota.id) !== Number(id),
  );

  if (daftarBaru.length === daftar.length) {
    throw new Error(`Kota dengan ID ${id} tidak ditemukan.`);
  }

  await AsyncStorage.setItem(
    KUNCI_PENYIMPANAN,
    JSON.stringify(daftarBaru),
  );

  // Pastikan data yang disimpan sudah sesuai.
  const hasilSimpan = await ambilSemuaFavorit();

  const masihAda = hasilSimpan.some(
    (kota) => Number(kota.id) === Number(id),
  );

  if (masihAda) {
    throw new Error("Kota masih tersimpan setelah proses penghapusan.");
  }
}
