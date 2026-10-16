import { GeocodingResponse, HasilGeocoding } from "../../types/geocoding";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Daftar kota lokal untuk pencarian offline
const KOTA_OFFLINE: HasilGeocoding[] = [
  {
    id: 1001,
    name: "Pekalongan",
    latitude: -6.8886,
    longitude: 109.6753,
    country: "Indonesia",
  },
  {
    id: 1002,
    name: "Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
    country: "Indonesia",
  },
  {
    id: 1003,
    name: "Bandung",
    latitude: -6.9175,
    longitude: 107.6191,
    country: "Indonesia",
  },
  {
    id: 1004,
    name: "Semarang",
    latitude: -6.9667,
    longitude: 110.4167,
    country: "Indonesia",
  },
  {
    id: 1005,
    name: "Surabaya",
    latitude: -7.2575,
    longitude: 112.7521,
    country: "Indonesia",
  },
  {
    id: 1006,
    name: "Yogyakarta",
    latitude: -7.7956,
    longitude: 110.3695,
    country: "Indonesia",
  },
  {
    id: 1007,
    name: "Malang",
    latitude: -7.9666,
    longitude: 112.6326,
    country: "Indonesia",
  },
  {
    id: 1008,
    name: "Medan",
    latitude: 3.5952,
    longitude: 98.6722,
    country: "Indonesia",
  },
  {
    id: 1009,
    name: "Denpasar",
    latitude: -8.6705,
    longitude: 115.2126,
    country: "Indonesia",
  },
  {
    id: 1010,
    name: "Makassar",
    latitude: -5.1477,
    longitude: 119.4327,
    country: "Indonesia",
  },
];

function cariKotaLokal(nama: string): HasilGeocoding[] {
  const query = nama.trim().toLocaleLowerCase("id");

  if (!query) return [];

  return KOTA_OFFLINE.filter((kota) =>
    kota.name.toLocaleLowerCase("id").includes(query),
  ).slice(0, 5);
}

export async function cariKota(nama: string): Promise<HasilGeocoding[]> {
  const query = nama.trim();

  if (!query) return [];

  try {
    const url =
      `${BASE_URL}?name=${encodeURIComponent(query)}` +
      "&count=5&language=id&format=json";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Gagal memuat data (${response.status})`);
    }

    const data: GeocodingResponse = await response.json();

    // Gunakan hasil API jika tersedia.
    if (data.results && data.results.length > 0) {
      return data.results;
    }

    // Jika API tidak menemukan kota, coba daftar lokal.
    return cariKotaLokal(query);
  } catch {
    // Jika offline atau API gagal, gunakan daftar lokal.
    return cariKotaLokal(query);
  }
}
