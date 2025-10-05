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
  "Amazing Rare", "Common", "LEGEND", "Promo", "Rare", "Rare ACE",
  "Rare BREAK", "Rare Holo", "Rare Holo EX", "Rare Holo GX", "Rare Holo LV.X",
  "Rare Holo Star", "Rare Holo V", "Rare Holo VMAX", "Rare Prime",
  "Rare Prism Star", "Rare Rainbow", "Rare Secret", "Rare Shining",
  "Rare Shiny", "Rare Shiny GX", "Rare Ultra", "Uncommon",
] as const;

type Rarity = (typeof RARITY_ORDER)[number] | "All";

export default function CollectionScreen() {
  const [owned, setOwned] = useState<Card[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [rarity, setRarity] = useState<Rarity>("All");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    await ensureSeed();
    const ids = await getCollection();
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

  const handleClearCollection = () => {
    Alert.alert("Clear collection?", "This will remove all saved cards.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearCollection();
          await load();
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
      <Text style={styles.title}>Your Collection</Text>
      <Text style={styles.counter}>{counterText}</Text>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setRarity("All")}
          style={[styles.filterChip, rarity === "All" && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, rarity === "All" && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        {["Common", "Uncommon", "Rare"].map((r) => {
          const active = rarity.toLowerCase() === r.toLowerCase();
          return (
            <Pressable
              key={r}
              onPress={() => setRarity(r as Rarity)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {r}
              </Text>
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

      {/* Clear Button */}
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
        <Text numberOfLines={1} style={styles.cardName}>{card.name}</Text>
        <Text numberOfLines={1} style={styles.cardSet}>{card.setName}</Text>
      </View>

      <View style={styles.rarityPill}>
        <Text style={styles.rarityText}>{card.rarity || "Unknown"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  container: { 
    padding: 20, 
    alignItems: "center", 
    paddingTop: 50, // 👈 extra breathing space for the header
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#0cc0df",
    marginBottom: 4,
    marginTop: 32, // 👈 adds space from top
  },
  
  counter: {
    fontSize: 13,
    color: "#777",
    marginBottom: 18,
    textAlign: "center",
  },

  searchRow: {
    width: "100%",
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fef6f9",
    borderWidth: 1,
    borderColor: "#f4a6b8",
    color: "#333",
    fontSize: 15,
  },

  filterRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fef6f9",
    borderWidth: 1,
    borderColor: "#f4a6b8",
  },
  filterChipActive: {
    backgroundColor: "#ff914d",
    borderColor: "#ff914d",
  },
  filterText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },

  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
  },

  cardTile: {
    flexBasis: 160,
    maxWidth: 180,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ffd9e1",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  cardImageWrap: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fef6f9",
    marginBottom: 8,
  },
  cardImage: { width: "100%", height: "100%" },
  cardImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  metaRow: { marginBottom: 6 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#333" },
  cardSet: { fontSize: 12, color: "#777" },

  rarityPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#0cc0df22",
  },
  rarityText: { fontSize: 11, fontWeight: "700", color: "#0cc0df" },

  empty: {
    marginTop: 40,
    color: "#777",
    textAlign: "center",
    fontSize: 14,
  },

  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#0cc0df",
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
