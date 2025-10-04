import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Button,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import StatCard from "../../components/statcard";

export default function ProfileScreen() {
  const [trainer, setTrainer] = useState({
    name: "Ash Ketchum",
    image:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/ash.png",
    cardsCollected: 42,
    coins: 1200,
    stepsForPack: 15342,
    allTimeSteps: 25432,
    lastSynced: new Date().toLocaleString(),
  });

  //Sync Feature
  const [refreshing, setRefreshing] = useState(false);

  // Conversion logic
  const stepsPerPoint = 100; // 100 steps = 1 point
  const packCost = 100; // 100 points = new pack
  const stepsPerPack = stepsPerPoint * packCost; // 10,000 steps = 1 pack

  const packsEarned = Math.floor(trainer.allTimeSteps / stepsPerPack);
  const stepsUsed = packsEarned * stepsPerPack;
  const stepsIntoCurrent = trainer.allTimeSteps - stepsUsed;
  const stepsRemaining = stepsPerPack - stepsIntoCurrent;

  const progress = stepsIntoCurrent / stepsPerPack;

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);

    // simulate fetching new data (e.g. from Apple Health / backend)
    setTimeout(() => {
      setTrainer((prev) => ({
        ...prev,
        allTimeSteps: prev.allTimeSteps + Math.floor(Math.random() * 1000), // simulate more steps
        lastSynced: new Date().toLocaleString(),
      }));
      setRefreshing(false);
    }, 1500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Last Synced & Refresh Control*/}
      <Text style={styles.lastSynced}>Last synced: {trainer.lastSynced}</Text>

      {/* Profile Image */}
      <Image source={{ uri: trainer.image }} style={styles.image} />
      <Text style={styles.name}>{trainer.name}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          {stepsIntoCurrent} / {stepsPerPack} steps → Next Pack
        </Text>

        {/* Custom progress bar using nested Views */}
        <View style={styles.progressBackground}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        <Text style={styles.packsEarned}>🎁 Packs Earned: {packsEarned}</Text>
        <Text style={styles.stepsRemaining}>
          {stepsRemaining} steps until next pack
        </Text>
      </View>
      {/* "Open Pack" Button — placeholder for later */}
      {packsEarned > 0 && (
        <Button
          title="OPEN A PACK!"
          onPress={() => alert("Pack opening coming soon! 🚀")}
        />
      )}
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Cards" value={trainer.cardsCollected} />
        <StatCard label="Coins" value={trainer.coins} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="All-Time Steps" value={trainer.allTimeSteps} />
        <StatCard label="Until Next Pack" value={stepsRemaining} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  lastSynced: {
    marginTop: 30,
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: "#444",
    textAlign: "center",
  },
  progressBackground: {
    width: "100%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ddd",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFCB05", // Pikachu yellow ⚡
  },
  packsEarned: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  stepsRemaining: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
