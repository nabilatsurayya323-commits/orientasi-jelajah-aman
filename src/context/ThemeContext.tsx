
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type Tema = "terang" | "gelap";

export const WARNA_TEMA = {
    terang: {
        background: "#F7F8FA",
        surface: "#FFFFFF",
        primary: "#C4DAE8",
        secondary: "#FEEFB8",
        text: "#432F2E",
        textSecondary: "#777777",
        border: "#D8E0E6",
        tabInactive: "#7C7772",
        danger: "#B42318",
    },
    gelap: {
        background: "#171C24",
        surface: "#252D38",
        primary: "#303D4D",
        secondary: "#5A5140",
        text: "#F4F1ED",
        textSecondary: "#C0C7D0",
        border: "#414B59",
        tabInactive: "#A7B0BB",
        danger: "#FF8A80",
    },
} as const;

const KUNCI_TEMA = "@jelajah_aman:tema";

type ThemeContextType = {
    tema: Tema;
    warna: (typeof WARNA_TEMA)[Tema];
    ubahTema: (tema: Tema) => Promise<void>;
    sedangMemuatTema: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [tema, setTema] = useState<Tema>("terang");
    const [sedangMemuatTema, setSedangMemuatTema] = useState(true);

    useEffect(() => {
        let aktif = true;

        async function muatTema() {
            try {
                const tersimpan = await AsyncStorage.getItem(KUNCI_TEMA);

                if (aktif && (tersimpan === "terang" || tersimpan === "gelap")) {
                    setTema(tersimpan);
                }
            } catch (error) {
                console.error("Gagal memuat tema:", error);
            } finally {
                if (aktif) setSedangMemuatTema(false);
            }
        }

        void muatTema();

        return () => {
            aktif = false;
        };
    }, []);

    const ubahTema = useCallback(async (temaBaru: Tema) => {
        const temaSebelumnya = tema;
        setTema(temaBaru);

        try {
            await AsyncStorage.setItem(KUNCI_TEMA, temaBaru);
        } catch (error) {
            setTema(temaSebelumnya);
            console.error("Gagal menyimpan tema:", error);
            throw error;
        }
    }, [tema]);

    return (
        <ThemeContext.Provider
            value={{
                tema,
                warna: WARNA_TEMA[tema],
                ubahTema,
                sedangMemuatTema,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTema() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTema harus digunakan di dalam ThemeProvider.");
    }

    return context;
}
