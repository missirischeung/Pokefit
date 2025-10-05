import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  TextInput,
  Modal,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import StatCard from "../../components/statcard";

import {
  ensureSeed,
  getUser,
  updateUser,
  getSteps,
  addSteps,
  addToCollection,
} from "../../lib/storage";
import { openFromSet } from "../../lib/cards";

const STORE_SETS = [
  // Adjust setId to match your dataset;
  { id: "sv3pt5", name: "Scarlet & Violet 151", logo: "https://images.pokemontcg.io/sv2a/logo.png", cost: 10 },
];

export default function ProfileScreen() {
  const [userName, setUserName] = useState("Ash Ketchum");
  const [coins, setCoins] = useState(1200);
  const [cardsCollected, setCardsCollected] = useState(0); // optional stat; not persisted here
  const [allTimeSteps, setAllTimeSteps] = useState(0);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleString());

  // steps input on profile
  const [stepInput, setStepInput] = useState("");

  // refresh
  const [refreshing, setRefreshing] = useState(false);

  // purchase modal
  const [showBuy, setShowBuy] = useState(false);
  const [selectedSet, setSelectedSet] = useState(STORE_SETS[0]);
  const [qty, setQty] = useState(1);
  const pullsPerPack = 5;
  const canDec = qty > 1;
  const canInc = qty < 10;

  const costSummary = useMemo(() => `${qty * selectedSet.cost} pts`, [qty, selectedSet]);

  // animated overlay 
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // -------- load local state on focus --------
  const loadLocal = useCallback(async () => {
    await ensureSeed();
    const u = await getUser();
    const s = await getSteps();
    if (u) {
      setUserName(u.name);
      setCoins(u.coins);
    }
    setAllTimeSteps(s);
    setLastSynced(new Date().toLocaleString());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocal().catch((e) => console.warn("loadLocal failed:", e));
    }, [loadLocal])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLocal()
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  // -------- points math (from steps) --------
  const stepsPerPoint = 100; // 100 steps = 1 point
  const packCost = 100; // 100 points per pack
  const stepsPerPack = stepsPerPoint * packCost; // 10,000 steps = 1 pack

  const totalPoints = Math.floor(allTimeSteps / stepsPerPoint);
  const packsEarned = Math.floor(allTimeSteps / stepsPerPack);
  const stepsUsed = packsEarned * stepsPerPack;
  const stepsIntoCurrent = allTimeSteps - stepsUsed;
  const stepsRemaining = stepsPerPack - stepsIntoCurrent;
  const pointsIntoCurrentPack = totalPoints % packCost;
  const pointProgress = pointsIntoCurrentPack / packCost;

  // -------- actions --------
  const handleAddSteps = async () => {
    const n = Math.floor(Number(stepInput));
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert("Invalid steps", "Enter a positive number.");
      return;
    }
    const next = await addSteps(n);
    setAllTimeSteps(next);
    setStepInput("");
    setLastSynced(new Date().toLocaleString());
  };

  const handleConfirmPurchase = async () => {
    try {
      // (Optional) validate points here 
      // const requiredPoints = qty * selectedSet.cost;
      // if (totalPoints < requiredPoints) { Alert.alert("Not enough points"); return; }

      const totalCards = qty * pullsPerPack;
      const pulls = openFromSet(selectedSet.id, totalCards); // local random from dataset

      await addToCollection(pulls.map((c) => c.id));

      // (Optional) deduct coins/points from user if you track them locally:
      // const u = await updateUser({ coins: Math.max(0, coins - requiredPoints) });
      // setCoins(u.coins);

      setShowBuy(false);
      Alert.alert(
        "Pack Opened 🎉",
        `You received ${pulls.length} cards.\n(Added to your collection.)`
      );
    } catch (e: any) {
      Alert.alert("Purchase failed", e?.message || "Try again.");
    }
  };

  // -------- overlay animations --------
  const handleOpenPackOverlay = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, friction: 7, useNativeDriver: true }),
    ]).start();
  };
  const handleClosePackOverlay = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Last Synced */}
        <Text style={styles.lastSynced}>Last synced: {lastSynced}</Text>

        {/* Profile header */}
        <Image
          source={{ uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/ash.png" }}
          style={styles.image}
        />
        <Text style={styles.name}>{userName}</Text>

        {/* 🔵 Steps → Next Point */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            {allTimeSteps % stepsPerPoint} / {stepsPerPoint} steps → Next Point
          </Text>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFillSecondary,
                { width: `${((allTimeSteps % stepsPerPoint) / stepsPerPoint) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* 🟡 Points → Next Pack */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            {pointsIntoCurrentPack} / {packCost} points → Next Pack
          </Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${pointProgress * 100}%` }]} />
          </View>
          <Text style={styles.packsEarned}>🎁 Packs Earned: {packsEarned}</Text>
        </View>

        {/* ➕ Add steps (on Profile) */}
        <View style={styles.addStepsCard}>
          <Text style={styles.addStepsTitle}>Add Steps</Text>
          <View style={styles.addStepsRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 8888"
              keyboardType="numeric"
              value={stepInput}
              onChangeText={setStepInput}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddSteps}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Apple HealthKit integration coming soon!</Text>
        </View>

        {/* Purchase/Open button → modal */}
        <TouchableOpacity style={styles.openPackButton} onPress={() => setShowBuy(true)}>
          <Text style={styles.openPackText}>🎁 Open a Pack</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Cards" value={cardsCollected} />
          <StatCard label="PokePoints" value={coins} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="All-Time Steps" value={allTimeSteps} />
          <StatCard label="Steps For Next Pack" value={stepsRemaining} />
        </View>
      </ScrollView>

      {/* ----- Purchase Modal ----- */}
      <Modal visible={showBuy} transparent animationType="fade" onRequestClose={() => setShowBuy(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Purchase Pack</Text>

            <View style={styles.packRow}>
              {STORE_SETS.map((s) => {
                const active = s.id === selectedSet.id;
                return (
                  <Pressable key={s.id} onPress={() => setSelectedSet(s)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.stepperRow}>
              <Pressable style={[styles.stepperBtn, !canDec && styles.stepperDisabled]} onPress={() => canDec && setQty(qty - 1)}>
                <Text style={styles.stepperText}>−</Text>
              </Pressable>
              <Text style={styles.qtyLabel}>{qty}</Text>
              <Pressable style={[styles.stepperBtn, !canInc && styles.stepperDisabled]} onPress={() => canInc && setQty(qty + 1)}>
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.modalCost}>Total: {costSummary}</Text>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={() => setShowBuy(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalConfirm]} onPress={handleConfirmPurchase}>
                <Text style={[styles.modalBtnText, styles.modalConfirmText]}>Purchase</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* (Optional) Keep your animated overlay as a separate “you’ve got a pack” flair */}
      {/* Trigger with handleOpenPackOverlay / handleClosePackOverlay if you want */}
      <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: fadeAnim }]} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20, backgroundColor: "#f4f4f4" },
  lastSynced: { marginTop: 30, fontSize: 12, color: "#999", fontStyle: "italic" },
  image: { width: 140, height: 140, borderRadius: 70, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },

  progressContainer: { width: "100%", marginBottom: 20 },
  progressLabel: { fontSize: 15, marginBottom: 6, color: "#333", textAlign: "center", fontWeight: "600" },
  progressBackground: { width: "100%", height: 14, borderRadius: 7, backgroundColor: "#ddd", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#FFCB05" },
  progressFillSecondary: { height: "100%", backgroundColor: "#3B4CCA" },
  packsEarned: { marginTop: 8, fontSize: 16, fontWeight: "500", textAlign: "center" },

  openPackButton: {
    backgroundColor: "#3B4CCA",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  openPackText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  // Add steps UI
  addStepsCard: {
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
  addStepsTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  addStepsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "800" },
  hint: { marginTop: 8, fontSize: 12, color: "#6b7280" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  packRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#e5e7eb" },
  chipActive: { backgroundColor: "#22c55e" },
  chipText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  stepperRow: { marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center" },
  stepperBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  stepperDisabled: { opacity: 0.5 },
  stepperText: { fontSize: 20, fontWeight: "900", color: "#111827", lineHeight: 22 },
  qtyLabel: { minWidth: 28, textAlign: "center", fontSize: 16, fontWeight: "700" },

  modalCost: { textAlign: "center", fontSize: 14, color: "#6b7280", marginBottom: 10 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#e5e7eb" },
  modalCancel: { backgroundColor: "#e5e7eb" },
  modalConfirm: { backgroundColor: "#22c55e" },
  modalBtnText: { fontWeight: "700", color: "#111827" },
  modalConfirmText: { color: "#fff" },

  // Optional animated overlay (not interactive in this version)
  overlay: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" },
});
