import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";

export default function TentangScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text accessibilityLabel="Judul halaman Tentang" style={styles.title}>
          Tentang
        </Text>

        <Text style={styles.text}>Nama aplikasi: Orientasi Jelajah Aman</Text>

        <Text style={styles.text}>Versi: 1.0.0</Text>

        <Text style={styles.text}>Pembuat: Nabila Tsurayya Ahmad</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.sedang,
    gap: spacing.kecil,
  },
  title: {
    fontSize: typeScale.judul,
    fontWeight: "700",
    marginBottom: spacing.kecil,
  },
  text: {
    fontSize: typeScale.isi,
  },
});
