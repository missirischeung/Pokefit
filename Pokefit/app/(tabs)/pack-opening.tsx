import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from "react-native";
import StatCard from "../../components/statcard";

// ---- Mock packs (same look/feel as Purchase) ----
type Pack = {
  id: string;
  name: string;
  logo: string;
  cost: number;
};

const PACKS: Pack[] = [
  {
    id: "sv151",
    name: "Scarlet & Violet 151",
    logo: "https://images.pokemontcg.io/sv2a/logo.png",
    cost: 10,
  },
];

// ---- Mock card pool ----
type Card = { id: string; name: string; rarity: string; image: string };
const MOCK_POOL: Record<string, Card[]> = {
  sv151: [
    { id: "sv3pt5-001", name: "Bulbasaur", rarity: "Common", image: "https://images.pokemontcg.io/sv3pt5/1_hires.png" },
    { id: "sv3pt5-004", name: "Charmander", rarity: "Common", image: "https://images.pokemontcg.io/sv3pt5/4_hires.png" },
    { id: "sv3pt5-007", name: "Squirtle",   rarity: "Common", image: "https://images.pokemontcg.io/sv3pt5/7_hires.png" },
    { id: "sv3pt5-045", name: "Haunter",    rarity: "Uncommon", image: "https://images.pokemontcg.io/sv3pt5/45_hires.png" },
    { id: "sv3pt5-080", name: "Pikachu",    rarity: "Common", image: "https://images.pokemontcg.io/sv3pt5/80_hires.png" },
    { id: "sv3pt5-150", name: "Mewtwo",     rarity: "Rare Holo", image: "https://images.pokemontcg.io/sv3pt5/150_hires.png" },
  ],
};

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
}

export default function PackOpeningScreen() {
  // points/packs are mocked here; wire to backend later
  const [selectedPack, setSelectedPack] = useState<Pack>(PACKS[0]);
  const [qty, setQty] = useState(1);
  const [revealed, setRevealed] = useState<Card[]>([]);
  const [totalOpened, setTotalOpened] = useState(0);

  const canDec = qty > 1;
  const canInc = qty < 10;

  const reveal = () => {
    const pool = MOCK_POOL[selectedPack.id] || [];
    if (pool.length === 0) {
      Alert.alert("No cards in pool", "This pack has no demo cards yet.");
      return;
    }
    // Simple: 5 cards per pack (demo); open qty * 5
    const pullsPerPack = 5;
    const pulls: Card[] = [];
    for (let i = 0; i < qty; i++) {
      pulls.push(...pickRandom(pool, pullsPerPack));
    }
    setRevealed(pulls);
    setTotalOpened((x) => x + qty);
  };

  const summary = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of revealed) map.set(c.rarity, (map.get(c.rarity) ?? 0) + 1);
    return Array.from(map.entries())
      .map(([rarity, count]) => `${rarity}: ${count}`)
      .join("  •  ");
  }, [revealed]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Pack Opening</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="Packs Opened" value={totalOpened} />
        <StatCard label="Last Pulls" value={revealed.length} />
      </View>

      {/* Pack select */}
      <View style={styles.selectorCard}>
        <View style={styles.selectorHeader}>
          <Text style={styles.selectorLabel}>Select Pack</Text>
          <Image source={{ uri: selectedPack.logo }} style={styles.selectorLogo} />
        </View>

        <View style={styles.packChips}>
          {PACKS.map((p) => {
            const active = p.id === selectedPack.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedPack(p)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Quantity stepper */}
        <View style={styles.stepperRow}>
          <Pressable
            style={[styles.stepperBtn, !canDec && styles.stepperDisabled]}
            onPress={() => canDec && setQty(qty - 1)}
          >
            <Text style={styles.stepperText}>−</Text>
          </Pressable>
          <Text style={styles.qtyLabel}>{qty}</Text>
          <Pressable
            style={[styles.stepperBtn, !canInc && styles.stepperDisabled]}
            onPress={() => canInc && setQty(qty + 1)}
          >
            <Text style={styles.stepperText}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={reveal}>
          <Text style={styles.buttonText}>Open {qty} Pack{qty > 1 ? "s" : ""}</Text>
        </Pressable>

        {revealed.length > 0 && (
          <Text style={styles.summaryText}>{summary}</Text>
        )}
      </View>

      {/* Revealed cards grid */}
      <View style={styles.grid}>
        {revealed.map((c) => (
          <View key={c.id + Math.random()} style={styles.cardTile}>
            <View style={styles.cardImageWrap}>
              <Image source={{ uri: c.image }} style={styles.cardImage} />
            </View>
            <Text numberOfLines={1} style={styles.cardName}>{c.name}</Text>
            <Text numberOfLines={1} style={styles.cardMeta}>
              {selectedPack.name} • {c.rarity}
            </Text>
          </View>
        ))}
        {revealed.length === 0 && (
          <Text style={styles.placeholder}>No cards revealed yet. Open a pack!</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
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

  // Selector card
  selectorCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectorLabel: { fontSize: 14, fontWeight: "700" },
  selectorLogo: { width: 96, height: 28, resizeMode: "contain" },

  packChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: "#22c55e" },
  chipText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  // Stepper
  stepperRow: {
    marginTop: 2,
    marginBottom: 10,
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
  stepperDisabled: {
    opacity: 0.5,
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

  button: {
    marginTop: 2,
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800" },

  summaryText: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },

  // Reveal grid
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginTop: 8,
  },
  cardTile: {
    flexBasis: 160,
    maxWidth: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  cardImageWrap: {
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
    width: "100%",
  },
  cardImage: { width: "100%", height: "100%" },
  cardName: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  cardMeta: { marginTop: 2, fontSize: 12, color: "#6b7280", textAlign: "center" },

  placeholder: {
    width: "100%",
    textAlign: "center",
    color: "#6b7280",
    marginTop: 16,
  },
});
