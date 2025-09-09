// ArticlesScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  exp: string; // "YYYY-MM-DD"
};

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const toISODate = (d: Date) => d.toISOString().split("T")[0];

// -> retourne null si date invalide (pas de valeur par défaut)
const parseISO = (s: string): Date | null => {
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfDay(d);
};

export default function ArticlesScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");

  // picker sans valeur par défaut
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list: Item[] = raw ? JSON.parse(raw) : [];
      setItems(list);
    } catch {
      Alert.alert("Erreur", "Lecture impossible.");
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
      Alert.alert("Erreur", "Sauvegarde impossible.");
    }
  }, []);

  // ouvre le picker uniquement si une date existe et est valide
  const openPicker = (it: Item) => {
    if (!it.exp) return;
    const parsed = parseISO(it.exp);
    if (!parsed) return; // pas de date par défaut
    setEditingId(it.id);
    setPickerDate(parsed);
    setShowPicker(true);
  };

  // applique la sélection et ferme
  const onChangeDate = (_: any, selected?: Date) => {
    setShowPicker(false);
    if (!editingId || !selected) {
      setEditingId(null);
      setPickerDate(null);
      return;
    }
    const picked = startOfDay(selected);
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === editingId ? { ...it, exp: toISODate(picked) } : it
      );
      persist(next);
      return next;
    });
    setEditingId(null);
    setPickerDate(null);
  };

  const visible = useMemo(() => {
    const match = (it: Item) =>
      it.name.toLowerCase().includes(q.trim().toLowerCase());
    return [...items].filter(match).sort((a, b) => b.qty - a.qty); // garde qty=0
  }, [items, q]);

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

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Articles</Text>
      </View>

      {/* Recherche */}
      <View style={s.searchWrap}>
        <MaterialIcons name="search" size={20} color="#6b7280" />
        <TextInput
          style={s.search}
          placeholder="Rechercher par nom"
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
        />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => setQ("")}>
            <MaterialIcons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visible.map((it) => (
          <View key={it.id} style={s.card}>
            <Image source={{ uri: PLACEHOLDER }} style={s.thumb} />
            <View style={s.cardBody}>
              <Text style={s.itemTitle}>{it.name}</Text>
              <Text style={s.itemSub}>{it.amount}</Text>

              <View style={s.expRow}>
                <MaterialIcons name="event" size={16} color="#6b7280" />
                <TouchableOpacity onPress={() => openPicker(it)}>
                  <Text style={s.itemExp}>{it.exp || "—"}</Text>
                </TouchableOpacity>
              </View>
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
        ))}

        {visible.length === 0 && (
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: "#6b7280" }}>Aucun article.</Text>
          </View>
        )}
      </ScrollView>

      {/* Picker sans valeur par défaut */}
      {showPicker && pickerDate && (
        <DateTimePicker
          mode="date"
          value={pickerDate}
          onChange={onChangeDate}
        />
      )}
    </SafeAreaView>
  );
}

const BG = "#f0f2f5";
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },

  searchWrap: {
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
  },
  search: { flex: 1 },

  listContent: { paddingHorizontal: 16, paddingBottom: 24, rowGap: 12 },
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
  expRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  itemExp: { color: "#374151", fontSize: 13, fontWeight: "600" },

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
});
