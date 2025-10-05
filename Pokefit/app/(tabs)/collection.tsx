// app/(tabs)/collection.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ensureSeed, getCollection, clearCollection } from "../../lib/storage";
import { getCardById, Card } from "../../lib/cards";

const RARITY_ORDER = [
  "Amazing Rare",
  "Common",
  "LEGEND",
  "Promo",
  "Rare",
  "Rare ACE",
  "Rare BREAK",
  "Rare Holo",
  "Rare Holo EX",
  "Rare Holo GX",
  "Rare Holo LV.X",
  "Rare Holo Star",
  "Rare Holo V",
  "Rare Holo VMAX",
  "Rare Prime",
  "Rare Prism Star",
  "Rare Rainbow",
  "Rare Secret",
  "Rare Shining",
  "Rare Shiny",
  "Rare Shiny GX",
  "Rare Ultra",
  "Uncommon",
] as const;

type Rarity = (typeof RARITY_ORDER)[number] | "All";

export default function CollectionScreen() {
  const [owned, setOwned] = useState<Card[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [rarity, setRarity] = useState<Rarity>("All");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    await ensureSeed(); // seeds empty collection [] on first run
    const ids = await getCollection(); // string[]
    const cards = ids.map((id) => getCardById(id)).filter((c): c is Card => !!c);
    setOwned(cards);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch((e) => console.warn("load collection failed", e));
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  const filteredByRarity = useMemo(() => {
    if (rarity === "All") return owned;
    return owned.filter((c) => (c.rarity || "").toLowerCase() === rarity.toLowerCase());
  }, [owned, rarity]);

  const normalizedQuery = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return filteredByRarity;
    return filteredByRarity.filter((c) => c.name.toLowerCase().includes(normalizedQuery));
  }, [filteredByRarity, normalizedQuery]);

  // Optionally sort: by rarity (per RARITY_ORDER) then name
  const sorted = useMemo(() => {
    const indexOf = (r: string) => {
      const i = RARITY_ORDER.findIndex(
        (x) => x.toLowerCase() === (r || "").toLowerCase()
      );
      return i === -1 ? 999 : i;
    };
    return [...filtered].sort((a, b) => {
      const ra = indexOf(a.rarity);
      const rb = indexOf(b.rarity);
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const totalOwned = owned.length;
  const visible = sorted.length;
  const showSubset = rarity !== "All" || normalizedQuery.length > 0;
  const counterText = showSubset ? `Showing ${visible} of ${totalOwned} cards` : `${totalOwned} cards`;

  // ---- Clear collection handler ----
  const handleClearCollection = () => {
    Alert.alert("Clear collection?", "This will remove all saved cards.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearCollection();
          await load(); // reload UI
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your Collection</Text>
        <Text style={styles.counter}>{counterText}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name…"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Rarity Filter */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setRarity("All")}
          style={[styles.filterChip, rarity === "All" && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, rarity === "All" && styles.filterTextActive]}>All</Text>
        </Pressable>
        {["Common", "Uncommon", "Rare"].map((r) => {
          const active = rarity.toLowerCase() === r.toLowerCase();
          return (
            <Pressable
              key={r}
              onPress={() => setRarity(r as Rarity)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{r}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {sorted.length === 0 ? (
          <Text style={styles.empty}>
            {totalOwned === 0
              ? "No cards yet. Open a pack from your Profile to add some!"
              : "No cards match your search/filter."}
          </Text>
        ) : (
          sorted.map((c) => <CardTile key={c.id} card={c} />)
        )}
      </View>

      {/* Clear Collection (dev helper) */}
      <View style={{ width: "100%", marginTop: 18, alignItems: "center" }}>
        <Pressable style={styles.clearBtn} onPress={handleClearCollection}>
          <Text style={styles.clearBtnText}>Clear Collection</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function CardTile({ card }: { card: Card }) {
  return (
    <View style={styles.cardTile}>
      <View style={styles.cardImageWrap}>
        {card.image ? (
          <Image source={{ uri: card.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={{ color: "#9CA3AF" }}>No Image</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Text numberOfLines={1} style={styles.cardName}>
          {card.name}
        </Text>
        <Text numberOfLines={1} style={styles.cardSet}>
          {card.setName}
        </Text>
      </View>

      {/* Rarity chip */}
      <View style={styles.rarityPill}>
        <Text style={styles.rarityText}>{card.rarity || "Unknown"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f4f4" },
  container: { padding: 16, alignItems: "center" },

  headerRow: {
    width: "100%",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  counter: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
  },

  // Search
  searchRow: {
    width: "100%",
    marginTop: 10,
    marginBottom: 8,
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Filters
  filterRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  filterChipActive: { backgroundColor: "#22c55e" },
  filterText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  // Grid
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginTop: 6,
  },

  cardTile: {
    flexBasis: 160,
    maxWidth: 190,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  cardImageWrap: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
  },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  metaRow: {
    marginBottom: 6,
  },
  cardName: { fontSize: 14, fontWeight: "700" },
  cardSet: { marginTop: 2, fontSize: 12, color: "#6b7280" },

  rarityPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },
  rarityText: { fontSize: 11, fontWeight: "700", color: "#4f46e5" },

  empty: { marginTop: 40, color: "#6b7280", textAlign: "center" },

  // Clear Collection Button
  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#ef4444", // red-500
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  clearBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
});
