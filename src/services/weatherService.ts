import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap } from "../../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const BATAS_WAKTU_MS = 3000;
const PREFIX_CACHE = "cache-cuaca:";

function buatKunci(latitude: number, longitude: number) {
  return `${PREFIX_CACHE}${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
}

async function ambilCache(
  latitude: number,
  longitude: number,
): Promise<DataCuacaLengkap | null> {
  try {
    const json = await AsyncStorage.getItem(buatKunci(latitude, longitude));

    if (!json) return null;

    const tersimpan = JSON.parse(json);
    return tersimpan.data as DataCuacaLengkap;
  } catch {
    return null;
  }
}

async function simpanCache(
  latitude: number,
  longitude: number,
  data: DataCuacaLengkap,
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
    // Kegagalan cache tidak boleh menggagalkan data cuaca.
  }
}

export async function ambilCuaca(
  latitude: number,
  longitude: number,
): Promise<DataCuacaLengkap> {
  const url =
    `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,weather_code,wind_speed_10m" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat cuaca (status ${response.status})`);
    }

    const data = await response.json();

    const hasil: DataCuacaLengkap = {
      saatIni: {
        suhu: data.current.temperature_2m,
        kodeCuaca: data.current.weather_code,
        kecepatanAngin: data.current.wind_speed_10m,
        waktu: data.current.time,
      },
      harian: {
        tanggal: data.daily.time,
        suhuMaksimal: data.daily.temperature_2m_max,
        suhuMinimal: data.daily.temperature_2m_min,
        kodeCuaca: data.daily.weather_code,
      },
    };

    await simpanCache(latitude, longitude, hasil);

    return hasil;
  } catch (err) {
    const cache = await ambilCache(latitude, longitude);

    if (cache) {
      return cache;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Internet tidak tersedia atau permintaan timeout, dan belum ada cache cuaca.",
      );
    }

    throw new Error(
      "Gagal memuat cuaca. Periksa koneksi atau pilih kota yang datanya pernah dimuat.",
    );
  } finally {
    clearTimeout(timer);
  }
}
