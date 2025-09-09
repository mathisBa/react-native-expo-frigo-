// FridgeScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
const router = useRouter();

import React, { useCallback, useState } from "react";

import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "fridge_items";
const PLACEHOLDER =
  "https://cpng.pikpng.com/pngl/s/597-5973859_unknown-png-png-download-unknown-png-clipart.png";

type Item = {
  id: string; // code-barres
  name: string;
  qty: number;
  amount: string;
  exp: string; // "YYYY-MM-DD" (AddItem) ou "Exp: dd/MM/yyyy" (ancien)
  imageUrl?: string;
};

function parseExp(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes("-")) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  // format "Exp: dd/MM/yyyy"
  const raw = dateStr.replace("Exp:", "").trim();
  const [day, month, year] = raw.split("/").map(Number);
  if (!day || !month || !year) return null;
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function getExpColor(dateStr: string) {
  const expDate = parseExp(dateStr);
  if (!expDate) return "#6b7280";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((expDate.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "#dc2626"; // rouge
  if (diffDays <= 3) return "#ca8a04"; // orange
  return "#16a34a"; // vert
}

export default function FridgeScreen() {
  const [items, setItems] = useState<Item[]>([]);

  // charge depuis AsyncStorage
  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Item[] = raw ? JSON.parse(raw) : [];
      setItems(list);
    } catch {
      Alert.alert("Erreur", "Impossible de lire le frigo.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const persist = useCallback(async (next: Item[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      Alert.alert("Erreur", "Impossible d’enregistrer les modifications.");
    }
  }, []);

  const inc = (id: string) => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, qty: it.qty + 1 } : it
      );
      persist(next);
      return next;
    });
  };

  const dec = (id: string) => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it
      );
      persist(next);
      return next;
    });
  };

  // projection triée et filtrée
  const visible = [...items]
    .filter((it) => it.qty > 0)
    .sort((a, b) => b.qty - a.qty);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ width: 48 }} />
        <Text style={s.headerTitle}>Mon Frigo</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => {
            /* action */
          }}
        >
          <MaterialIcons name="add" size={22} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={visible}
        renderItem={({ item: it }) => (
          <View style={s.card}>
            <Image source={{ uri: it.imageUrl || PLACEHOLDER }} style={s.thumb} />
            <View style={s.cardBody}>
              <Text style={s.itemTitle}>{it.name}</Text>
              <Text style={s.itemSub}>{it.amount}</Text>
              <Text style={[s.itemExp, { color: getExpColor(it.exp) }]}>
                {it.exp}
              </Text>
            </View>
            <View style={s.qtyWrap}>
              <TouchableOpacity style={s.qtyBtn} onPress={() => dec(it.id)}>
                <Text style={s.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={s.qtyText}>{it.qty}</Text>
              <TouchableOpacity style={s.qtyBtn} onPress={() => inc(it.id)}>
                <Text style={s.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(it) => it.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: "#6b7280" }}>Aucun article à afficher.</Text>
          </View>
        }
      />

      {/* Boutons flottants */}
      <View pointerEvents="box-none" style={s.fabs}>
        <TouchableOpacity
          style={[s.fab, s.fabGray]}
          onPress={() => {
            /* panier */
            router.push("/articles");
          }}
        >
          <MaterialIcons name="add-shopping-cart" size={24} color="#1f2937" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.fab, s.fabGreen]}
          onPress={() => {
            router.push("/add");
          }}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const BG = "#f0f2f5";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 4, android: 8 }),
    paddingBottom: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { padding: 16, paddingBottom: 96, rowGap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  cardBody: { flex: 1, marginLeft: 12 },
  itemTitle: { color: "#1f2937", fontSize: 16, fontWeight: "600" },
  itemSub: { color: "#6b7280", fontSize: 13, marginTop: 2 },
  itemExp: { fontSize: 13, marginTop: 2, fontWeight: "600" },
  qtyWrap: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  qtyText: { width: 24, textAlign: "center", fontSize: 16, fontWeight: "700" },
  fabs: { position: "absolute", right: 16, bottom: 120, gap: 12 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabGray: { backgroundColor: "#e5e7eb" },
  fabGreen: { backgroundColor: "#16a34a" },
});
