import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataKualitasUdara } from "../../types/weather";

const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const BATAS_WAKTU_MS = 3000;
const PREFIX_CACHE = "cache-aqi:";

function buatKunci(latitude: number, longitude: number) {
  return `${PREFIX_CACHE}${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
}

async function ambilCache(
  latitude: number,
  longitude: number,
): Promise<DataKualitasUdara | null> {
  try {
    const json = await AsyncStorage.getItem(buatKunci(latitude, longitude));

    if (!json) return null;

    const tersimpan = JSON.parse(json);
    return tersimpan.data as DataKualitasUdara;
  } catch {
    return null;
  }
}

async function simpanCache(
  latitude: number,
  longitude: number,
  data: DataKualitasUdara,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      buatKunci(latitude, longitude),
      JSON.stringify({
        data,
        disimpanPada: Date.now(),
      }),
    );
  } catch {
    // Kegagalan menyimpan cache tidak menggagalkan data utama.
  }
}

export async function ambilKualitasUdara(
  latitude: number,
  longitude: number,
): Promise<DataKualitasUdara> {
  const url =
    `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
    "&current=european_aqi,pm2_5,pm10";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Gagal memuat kualitas udara (status ${response.status})`,
      );
    }

    const data = await response.json();

    const hasil: DataKualitasUdara = {
      indeksAQI: data.current.european_aqi,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
    };

    await simpanCache(latitude, longitude, hasil);

    return hasil;
  } catch {
    const cache = await ambilCache(latitude, longitude);

    if (cache) {
      return cache;
    }

    throw new Error(
      "Kualitas udara tidak tersedia. Periksa koneksi atau pilih kota yang datanya pernah dimuat.",
    );
  } finally {
    clearTimeout(timer);
  }
}
