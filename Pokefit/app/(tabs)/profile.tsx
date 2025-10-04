import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import React, { useState } from "react";
import StatCard from "../../components/statcard";

export default function ProfileScreen() {
  const [trainer, setTrainer] = useState({
    name: "Ash Ketchum",
    image:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/ash.png",
    cardsCollected: 42,
    coins: 1200,
    steps: 15342,
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: trainer.image }} style={styles.image} />
      <Text style={styles.name}>{trainer.name}</Text>

      <View style={styles.statsRow}>
        <StatCard label="Cards" value={trainer.cardsCollected} />
        <StatCard label="Coins" value={trainer.coins} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Steps" value={trainer.steps} />
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
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
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
});
