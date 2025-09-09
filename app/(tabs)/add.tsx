// AddItemScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  id: string; // code-barres
  name: string;
  qty: number;
  amount: string; // "500g", "1L", etc.
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

  const [expDate, setExpDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!perm) return;
    if (!perm.granted && perm.canAskAgain) requestPermission();
  }, [perm, requestPermission]);

  const onBarcode = useCallback(async ({ data }: { data: string }) => {
    if (!data) return;
    setBarcode(data);
    setScanning(false);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${data}`
      );
      if (!response.ok) {
        throw new Error("Produit non trouvé");
      }
      const json = await response.json();
      if (json.status !== 1 || !json.product) {
        Alert.alert("Info", "Produit non trouvé dans la base de données Open Food Facts.");
        return;
      }

      const { product } = json;
      if (product.product_name_fr) {
        setName(product.product_name_fr);
      }
      if (product.quantity) {
        setAmount(product.quantity);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de récupérer les informations du produit.");
    }
  }, []);

  const save = useCallback(async () => {
    const q = parseInt(qty, 10);
    if (
      !name.trim() ||
      !barcode.trim() ||
      !expDate ||
      Number.isNaN(q) ||
      q < 1
    ) {
      Alert.alert("Champs requis", "Nom, quantité (≥1), date et code-barres.");
      return;
    }
    const newItem: Item = {
      id: barcode.trim(),
      name: name.trim(),
      qty: q,
      amount: amount.trim(),
      exp: toISODate(expDate),
    };
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Item[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((it) => it.id === newItem.id);
      if (idx >= 0) list[idx] = newItem;
      else list.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      Alert.alert("Ajouté", "Article enregistré.");
      // reset
      setName("");
      setQty("1");
      setAmount("");
      setBarcode("");
      setExpDate(null);
      setScanning(perm?.granted ?? false);
    } catch {
      Alert.alert("Erreur", "Impossible d’enregistrer l’article.");
    }
  }, [name, qty, amount, barcode, expDate, perm]);

  const showScanner = (perm?.granted ?? false) && scanning;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => setScanning((v) => (perm?.granted ? !v : v))}
          style={s.iconBtn}
        >
          <MaterialIcons name="qr-code-scanner" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Ajouter un article</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.container}>
        {/* Scanner ou placeholder */}
        <ScrollView
          contentContainerStyle={s.form}
          keyboardShouldPersistTaps="handled"
        >
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
                    ? "Touchez l’icône pour activer le scan."
                    : "Caméra non autorisée. Saisissez le code-barres ci-dessous."}
                </Text>
              </View>
            )}
          </View>

          {/* Formulaire */}

          <Field label="Nom de l’article">
            <TextInput
              style={s.input}
              placeholder="Ex: Lait d’amande"
              value={name}
              onChangeText={setName}
            />
          </Field>

          <Field label="Quantité">
            <View style={s.qtyRow}>
              <Step onPress={() => setQty(String(Math.max(1, toInt(qty) - 1)))}>
                -
              </Step>
              <TextInput
                style={[s.input, s.qtyInput]}
                keyboardType="number-pad"
                value={qty}
                onChangeText={setQty}
              />
              <Step onPress={() => setQty(String(toInt(qty) + 1))}>+</Step>
            </View>
          </Field>

          <Field label="Quantité (ex: 1L, 500g)">
            <TextInput
              style={s.input}
              placeholder="Ex: 1L"
              value={amount}
              onChangeText={setAmount}
            />
          </Field>

          <Field label="Date de péremption">
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={s.input}
            >
              <Text>{expDate ? toISODate(expDate) : "Choisir une date"}</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                mode="date"
                value={expDate ?? new Date()}
                onChange={(e, d) => {
                  setShowPicker(false);
                  if (d) setExpDate(startOfDay(d));
                }}
              />
            )}
          </Field>

          <Field label="Code-barres">
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
                  : "Scanner inactif."
                : "Autorisation refusée. Saisie manuelle requise."}
            </Text>
          </Field>

          <TouchableOpacity style={s.submit} onPress={save}>
            <Text style={s.submitTxt}>Ajouter au frigo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* Helpers UI */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}
function Step({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={s.stepBtn} onPress={onPress}>
      <Text style={s.stepTxt}>{children}</Text>
    </TouchableOpacity>
  );
}

/* Helpers date + parse */
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}
function toInt(v: string) {
  const n = parseInt(v || "1", 10);
  return Number.isNaN(n) ? 1 : n;
}

/* Styles */
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

  form: { paddingHorizontal: 16, paddingBottom: 60 },
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
    width: 90,
    borderRadius: 10,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  stepBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginHorizontal: 6,
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
