import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import StatCard from "../../components/statcard";

// --- Mock data ---
type CardItem = {
  id: string;
  name: string;
  set: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Holo";
  image: string;
  qty: number;
};

const MOCK: CardItem[] = [
  { id: "xy7-54", name: "Pikachu", set: "Ancient Origins", rarity: "Common",   image: "https://images.pokemontcg.io/base1/58_hires.png", qty: 2 },
  { id: "sm1-12", name: "Caterpie", set: "Sun & Moon",      rarity: "Common",   image: "https://images.pokemontcg.io/sm1/1_hires.png",   qty: 1 },
  { id: "sv1-15", name: "Charcadet",set: "Scarlet & Violet",rarity: "Uncommon", image: "https://images.pokemontcg.io/sv1/28_hires.png",  qty: 3 },
  { id: "swsh4-25",name: "Charmeleon",set:"Vivid Voltage",  rarity: "Uncommon", image: "https://images.pokemontcg.io/swsh4/24_hires.png",qty: 1 },
];

const RARITIES = ["All", "Common", "Uncommon", "Rare", "Holo"] as const;
type RarityFilter = (typeof RARITIES)[number];

export default function CollectionScreen() {
  const [query, setQuery]   = useState("");
  const [rarity, setRarity] = useState<RarityFilter>("All");

  const totalCards  = MOCK.reduce((sum, c) => sum + c.qty, 0);
  const uniqueCards = MOCK.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK.filter((c) => {
      const text =
        c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q) || q === "";
      const rOk = rarity === "All" || c.rarity === rarity;
      return text && rOk;
    });
  }, [query, rarity]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Pokemon Collection</Text>

      {/* Stat cards — same component/spacing vibe as Profile */}
      <View style={styles.statsRow}>
        <StatCard label="Total Cards Collected" value={totalCards} />
        <StatCard label="Unique Cards Collected" value={uniqueCards} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Search name or set…"
          placeholderTextColor="#Gastly"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Rarity chips */}
      <View style={styles.filtersRow}>
        {RARITIES.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRarity(r)}
            style={[styles.chip, rarity === r && styles.chipActive]}
          >
            <Text style={[styles.chipText, rarity === r && styles.chipTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, justifyContent: "center"}}
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ marginTop: 12, width: "100%" }}
        renderItem={({ item }) => <CardTile item={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No cards match your filters.</Text>}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

function CardTile({ item }: { item: CardItem }) {
    return (
      <View style={styles.cardTile}>
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        </View>
  
        <View style={styles.cardInfoRow}>
          <Text numberOfLines={1} style={styles.cardName}>
            {item.name}
          </Text>
          <View style={styles.qtyBadgeInline}>
            <Text style={styles.qtyTextInline}>x{item.qty}</Text>
          </View>
        </View>
  
        <Text numberOfLines={1} style={styles.cardMeta}>
          {item.set} • {item.rarity}
        </Text>
      </View>
    );
  }
  

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "flex-start",
  },

  // Stat cards row 
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },

  // Search
  searchWrap: { width: "100%", marginTop: 4, marginBottom: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Chips
  filtersRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
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

  // Grid tiles (card)
  cardTile: {
    flex: 1,
    maxWidth: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignSelf: "center",
  },
  cardImageWrap: {
    aspectRatio: 3 / 4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    marginBottom: 8,
    position: "relative",
  },
  cardImage: { width: "100%", height: "100%" },
  cardName: { fontSize: 14, fontWeight: "700" },
  cardMeta: { marginTop: 2, fontSize: 12, color: "#6b7280" },
  cardInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyBadgeInline: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qtyTextInline: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  page: {
    flex: 1,
    backgroundColor: "#f4f4f4", 
  },
  
  // Empty state
  empty: { textAlign: "center", color: "#6b7280", marginTop: 24, width: "100%" },
});
