import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

type Trainer = {
  trainerId: string;
  name: string;
  age: number;
  country: string;
}

export default function CreateProfile() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string>("");

  const postTrainer = async (trainer: Trainer) => {
  try {
    const res = await fetch("http://localhost:3000/trainer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        trainerId: trainer.trainerId,
        name: trainer.name,
        age: trainer.age,
        country: trainer.country
      }),
    });
    if (!res.ok) {
      console.log(res);
      throw new Error("Failed to create trainer");
    }
    return await res.json();
  } catch (e) {
    console.error("Error posting trainer:", e);
    throw e;
  }
}

  const handleCreateProfile = () => {
    if (!name || !age || !country) {
      Alert.alert("Please fill out all fields.");
      return;
    }

    if (!userId || userId == "") {
      Alert.alert("User not logged in.");
      return;
    }

    const trainer : Trainer = {
      trainerId: userId,
      name: name,
      age: parseInt(age),
      country: country
    }

    postTrainer(trainer)
      .then(() => {
        Alert.alert(
          "Profile Created",
          `Name: ${name}\nAge: ${age}\nCountry: ${country}`
        );
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserId(session?.user.id!);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user.id!);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Trainer Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ""))}
        keyboardType="numeric"
        maxLength={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
        autoCapitalize="words"
      />
      <View style={styles.buttonContainer}>
        <Button title="Create Trainer" onPress={handleCreateProfile} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    marginTop: 12,
  },
});
