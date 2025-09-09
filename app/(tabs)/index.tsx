// FridgeScreen.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Item = {
  id: string;
  name: string;
  qty: number;
  amount: string;
  exp: string;
  img: string;
};

const INITIAL: Item[] = [
  {
    id: "1",
    name: "Tomates",
    qty: 1,
    amount: "500g",
    exp: "Exp: 25/12/2025",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeaKWlQ8WTn7n-yd0Qh59WoM2xF-RVW19One1SwhsPFpDAUcbv_vZ-xyDzCb96p2899BarZJVLARvg14nuMnU5LIZBOse09_zr2oWH2aLr2ZVG1FUmEOCIzzhfqfojkindxApnyppSTdcMzuDlL4pNgOw1oRewFvvto2Q8LBLMZi2ZCAMHqDkpbg1HuYGHMi1l9EwhMwlQly70t1L71o8H_CedXme5PeBLUmkNErrXfqFAk3V2fsvNh3Jea8aWbsB4fRyEkRdf45WK",
  },
  {
    id: "2",
    name: "Carottes",
    qty: 1,
    amount: "200g",
    exp: "Exp: 20/12/2026",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB02WU6VofsxVuUM0BuIKHVGEKc1lCDsGyfBe7l6DFNUqgMML7LKY7oOUti6XKVg9AmruMPb4HFgyvuuonKSual0SiEflhqkGim0yG88BL1NQCLI8ay0__eLn5Jz2ZNce-CiatsiQYQ4u0qd9lQy0Ecgjf0Z2pFSaBwslnHbYfApqeV8zIyMq-b6TWk21OSe3Py3Wqaaj4Pxg1tz_XfWFHKZo4JGNHR2btPzGbQ4NWQlko9AUWsNaMwuv8fIstg8OBnihTmmwRBGya_",
  },
  {
    id: "3",
    name: "Lait",
    qty: 1,
    amount: "1L",
    exp: "Exp: 15/12/2024",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxgIVPps-rWx93J_7OR1DNYIkdNP2iQ1x6VGnGxhlEJWgH7cZxe4mPl1OFQb6NhHDVNG6qZzbLtu6pcWRTtCtiZoSzkjh7y-8iHsvAuHU90dalTYV2bvEju9Rpz__f9V2XyjB4eI3P7NUR9ko8cKiUtdHYuzIk-ihVExGeF66yChmzE6Y9bibDRmeXi5P5Y3R5B6byUqaEkT7vQha996idhhaxQ0BvUQBhMjKVk_3at_96Jyd70lSODcmRI-lpbEJch0yuYxKqCBrm",
  },
];

function getExpColor(dateStr: string) {
  const raw = dateStr.replace("Exp:", "").trim();
  const [day, month, year] = raw.split("/").map(Number);
  const expDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "#dc2626"; // rouge, déjà expiré
  if (diffDays <= 3) return "#ca8a04"; // orange, <= 3 jours restants
  return "#16a34a"; // vert, > 3 jours
}

export default function FridgeScreen() {
  const [items, setItems] = useState(INITIAL);

  const inc = (id: string) =>
    setItems((p) =>
      p.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );
  const dec = (id: string) =>
    setItems((p) =>
      p.map((it) =>
        it.id === id ? { ...it, qty: Math.max(0, it.qty - 1) } : it
      )
    );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ width: 48 }} />
        <Text style={s.headerTitle}>Mon Frigo</Text>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => {
            /* add action */
          }}
        >
          <MaterialIcons name="add" size={22} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <ScrollView
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((it) => (
          <View key={it.id} style={s.card}>
            <Image source={{ uri: it.img }} style={s.thumb} />
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
        ))}
      </ScrollView>

      {/* Boutons flottants */}
      <View pointerEvents="box-none" style={s.fabs}>
        <TouchableOpacity
          style={[s.fab, s.fabGray]}
          onPress={() => {
            /* panier */
          }}
        >
          <MaterialIcons name="add-shopping-cart" size={24} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.fab, s.fabGreen]}
          onPress={() => {
            /* scanner */
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
