import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import StatCard from "../../components/statcard";

// Mock user points
const START_POINTS = 120;

// Mock pack data 
type Pack = {
  id: string;
  name: string;
  logo: string;
  cost: number; // points per pack
};

const PACKS: Pack[] = [
  {
    id: "sv151",
    name: "Scarlet & Violet 151",
    logo: "https://images.pokemontcg.io/sv2a/logo.png", 
    cost: 10,
  },
  // Add more packs later 
];

export default function PurchaseScreen() {
  const [points, setPoints] = useState(START_POINTS);
  const [purchases, setPurchases] = useState<Record<string, number>>({});
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(PACKS.map((p) => [p.id, 1]))
  );

  const totalPurchased = useMemo(
    () => Object.values(purchases).reduce((a, b) => a + b, 0),
    [purchases]
  );

  function inc(id: string) {
    setQty((q) => ({ ...q, [id]: Math.min((q[id] ?? 1) + 1, 99) }));
  }
  function dec(id: string) {
    setQty((q) => ({ ...q, [id]: Math.max((q[id] ?? 1) - 1, 1) }));
  }

  function buy(pack: Pack) {
    const n = qty[pack.id] ?? 1;
    const totalCost = n * pack.cost;

    if (points < totalCost) {
      Alert.alert(
        "Not enough PokePoints",
        `You need ${totalCost} PokePoints to purchase ${n} pack${n > 1 ? "s" : ""}.`
      );
      return;
    }

    setPoints((p) => p - totalCost);
    setPurchases((prev) => ({ ...prev, [pack.id]: (prev[pack.id] ?? 0) + n }));
    Alert.alert("Success", `Purchased ${n}× ${pack.name}`);
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Pack Store</Text>

      {/* Stat cards — match Profile look */}
      <View style={styles.statsRow}>
        <StatCard label="Your PokePoints" value={points} />
        <StatCard label="Packs Bought" value={totalPurchased} />
      </View>

      {/* Packs grid */}
      <View style={styles.grid}>
        {PACKS.map((p) => {
          const owned = purchases[p.id] ?? 0;
          const n = qty[p.id] ?? 1;
          const totalCost = n * p.cost;
          const canBuy = points >= totalCost;

          return (
            <View style={styles.card} key={p.id}>
              <View style={styles.logoWrap}>
                <Image source={{ uri: p.logo }} style={styles.logo} />
              </View>

              <Text style={styles.packName}>{p.name}</Text>
              <Text style={styles.meta}>Cost: {p.cost} pts / pack</Text>
              {owned > 0 && <Text style={styles.owned}>Owned: {owned}</Text>}

              {/* Quantity stepper */}
              <View style={styles.stepperRow}>
                <Pressable style={styles.stepperBtn} onPress={() => dec(p.id)}>
                  <Text style={styles.stepperText}>−</Text>
                </Pressable>
                <Text style={styles.qtyLabel}>{n}</Text>
                <Pressable style={styles.stepperBtn} onPress={() => inc(p.id)}>
                  <Text style={styles.stepperText}>+</Text>
                </Pressable>
              </View>

              {/* Total cost preview */}
              <Text style={styles.totalCost}>
                Total: <Text style={styles.totalCostStrong}>{totalCost}</Text> pts
              </Text>

              <Pressable
                onPress={() => buy(p)}
                style={[styles.button, !canBuy && styles.buttonDisabled]}
                disabled={!canBuy}
              >
                <Text style={styles.buttonText}>
                  {canBuy ? "Purchase" : "Not Enough Points"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Text style={styles.note}>
        Using mock data for now.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Page container — mirrors Profile
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },

  // Grid
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    justifyContent: "center", 
  },
  card: {
    flexBasis: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Logo block
  logoWrap: {
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 10,
  },
  logo: { width: "80%", height: 40, resizeMode: "contain" },

  packName: { fontSize: 14, fontWeight: "700" },
  meta: { marginTop: 2, fontSize: 12, color: "#6b7280" },
  owned: { marginTop: 2, fontSize: 12, color: "#374151", fontWeight: "600" },

  // Stepper
  stepperRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 22,
  },
  qtyLabel: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  totalCost: { fontSize: 12, color: "#6b7280", marginBottom: 8 },
  totalCostStrong: { color: "#111827", fontWeight: "800" },

  // Button — match profile accent
  button: {
    marginTop: 2,
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "800" },

  note: {
    width: "100%",
    marginTop: 16,
    color: "#6b7280",
    fontSize: 12,
  },

  page: {
    flex: 1,
    backgroundColor: "#f4f4f4", 
  },
});
