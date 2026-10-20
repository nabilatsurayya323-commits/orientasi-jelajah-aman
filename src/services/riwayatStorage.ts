import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HasilGeocoding } from "../../types/geocoding";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
const MAKSIMAL_RIWAYAT = 10;

export async function ambilRiwayat(): Promise<HasilGeocoding[]> {
  const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);

  if (!json) {
    return [];
  }

  const data: unknown = JSON.parse(json);

  if (!Array.isArray(data)) {
    return [];
  }

  return data as HasilGeocoding[];
}

export async function simpanRiwayat(kota: HasilGeocoding): Promise<void> {
  const riwayatLama = await ambilRiwayat();

  // Kota yang sama dipindahkan ke urutan paling baru.
  const tanpaDuplikat = riwayatLama.filter(
    (item) => Number(item.id) !== Number(kota.id),
  );

  const riwayatBaru = [kota, ...tanpaDuplikat].slice(0, MAKSIMAL_RIWAYAT);

  await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(riwayatBaru));
}

export async function hapusRiwayat(): Promise<void> {
  await AsyncStorage.removeItem(KUNCI_RIWAYAT);
}
