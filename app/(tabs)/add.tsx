// AddItemScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Item = {
  id: string; // = code barre
  name: string;
  qty: number;
  amount: string;
  exp: string; // "YYYY-MM-DD"
};

const STORAGE_KEY = "fridge_items";

export default function AddItemScreen() {
  const [perm, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [amount, setAmount] = useState("");
  const [exp, setExp] = useState("");

  useEffect(() => {
    // si pas encore demandé, on ne bloque pas l'UI
    if (!perm) return;
    if (!perm.granted && perm.canAskAgain) requestPermission();
  }, [perm, requestPermission]);

  const onBarcode = useCallback(({ data }: { data: string }) => {
    if (!data) return;
    setBarcode(data);
    setScanning(false);
  }, []);

  const save = useCallback(async () => {
    const q = parseInt(qty, 10);
    if (
      !name.trim() ||
      !exp.trim() ||
      !barcode.trim() ||
      Number.isNaN(q) ||
      q < 1
    ) {
      Alert.alert("Champs requis", "Nom, quantité (≥1), date et code-barres.");
      return;
    }
    const newItem: Item = {
      id: barcode.trim(), // id = code barre
      name: name.trim(),
      qty: q,
      amount: amount.trim(),
      exp: exp.trim(),
    };
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let list: Item[] = raw ? JSON.parse(raw) : [];
      // si l'article existe déjà, on le remplace
      const idx = list.findIndex((it) => it.id === newItem.id);
      if (idx >= 0) list[idx] = newItem;
      else list.push(newItem);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      Alert.alert("Ajouté", "Article enregistré dans le frigo.");
      // reset
      setName("");
      setQty("1");
      setAmount("");
      setExp("");
      setBarcode("");
      setScanning(perm?.granted ?? false);
    } catch (e) {
      Alert.alert("Erreur", "Impossible d’enregistrer l’article.");
    }
  }, [name, qty, amount, exp, barcode, perm]);

  const showScanner = (perm?.granted ?? false) && scanning;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => setScanning((v) => !v)}
          style={s.iconBtn}
        >
          <MaterialIcons name="qr-code-scanner" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Scanner un article</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.container}>
        {/* Zone caméra ou placeholder + saisie code-barres */}
        <View style={s.scannerBox}>
          {showScanner ? (
            <CameraView
              style={s.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "qr",
                ],
              }}
              onBarcodeScanned={(res) => onBarcode({ data: res.data })}
            />
          ) : (
            <View style={s.cameraPlaceholder}>
              <Text style={s.cameraText}>
                {perm?.granted
                  ? "Appuyez sur l’icône pour relancer le scan."
                  : "Autorisation caméra refusée. Saisissez le code-barres à la main."}
              </Text>
            </View>
          )}
        </View>

        {/* Formulaire */}
        <ScrollView
          contentContainerStyle={s.form}
          keyboardShouldPersistTaps="handled"
        >
          <L label="Nom de l’article">
            <TextInput
              style={s.input}
              placeholder="Ex: Lait d’amande"
              value={name}
              onChangeText={setName}
            />
          </L>

          <L label="Quantité">
            <View style={s.qtyRow}>
              <TouchableOpacity
                style={[
                  s.stepBtn,
                  { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
                ]}
                onPress={() =>
                  setQty(
                    String(Math.max(1, (parseInt(qty || "1", 10) || 1) - 1))
                  )
                }
              >
                <Text style={s.stepTxt}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={[s.input, s.qtyInput]}
                keyboardType="number-pad"
                value={qty}
                onChangeText={setQty}
              />
              <TouchableOpacity
                style={[
                  s.stepBtn,
                  { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
                ]}
                onPress={() =>
                  setQty(String((parseInt(qty || "1", 10) || 1) + 1))
                }
              >
                <Text style={s.stepTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </L>

          <L label="Quantité (ex: 1L, 500g)">
            <TextInput
              style={s.input}
              placeholder="Ex: 1L"
              value={amount}
              onChangeText={setAmount}
            />
          </L>

          <L label="Date de péremption">
            <TextInput
              style={s.input}
              placeholder="YYYY-MM-DD"
              value={exp}
              onChangeText={setExp}
              inputMode="numeric"
            />
          </L>

          <L label="Code-barres">
            <TextInput
              style={s.input}
              placeholder="Scannez ou saisissez"
              value={barcode}
              onChangeText={setBarcode}
            />
            <Text style={s.helper}>
              {perm?.granted
                ? scanning
                  ? "Scanner actif."
                  : "Scanner inactif. Touchez l’icône pour rescanner."
                : "Caméra non autorisée. Saisie manuelle requise."}
            </Text>
          </L>

          <TouchableOpacity style={s.submit} onPress={save}>
            <Text style={s.submitTxt}>Ajouter au frigo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const BG = "#0b0f14";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  container: { flex: 1 },
  scannerBox: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#6B8A7A",
    aspectRatio: 3 / 4,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  camera: { flex: 1 },
  cameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },

  form: { paddingHorizontal: 16, paddingBottom: 24 },
  label: { color: "#cbd5e1", fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyInput: {
    textAlign: "center",
    width: 80,
    borderRadius: 0,
    marginHorizontal: 0,
  },
  stepBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  stepTxt: { fontSize: 18, fontWeight: "700", color: "#1f2937" },

  helper: { color: "#94a3b8", fontSize: 12, marginTop: 6 },
  submit: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#6B8A7A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  submitTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
