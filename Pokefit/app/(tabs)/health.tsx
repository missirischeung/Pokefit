import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

type StepData = {
  trainerId: string;
  activity_date: string;
  metricType: string;
  metric: number;
};

export default function HealthScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string>("");

  const [steps, setSteps] = useState<StepData[]>([]);
  const [stepInput, setStepInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchHealthData = async (): Promise<StepData[]> => {
    if (!userId || userId == "") return [];

    try {
      const res = await fetch(`http://localhost:3000/healthData/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch health data");
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Error fetching health data:", e);
      return [];
    }
  }

  const postHealthData = async (step: StepData) => {
    try {
      return await fetch("http://localhost:3000/healthData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: step.trainerId, // use session user id
          metricType: step.metricType,
          metric: step.metric,
          activityDate: step.activity_date,
        }),
      });
    } catch (e) {
      console.error("Error posting health data:", e);
    }
  }

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

  useEffect(() => {
    fetchHealthData().then((res) => {
      setSteps(res);
    });
  }, []);

  const addStepEntry = async () => {
    if (!selectedDate || !stepInput) return;
    const newEntry: StepData = {
      trainerId: userId,
      activity_date: selectedDate.toLocaleDateString(),
      metricType: "STEPS",
      metric: parseInt(stepInput),
    };

    const resp = await postHealthData(newEntry);

    if (resp && !resp.ok) {
      Alert.alert("Error", "Failed to add step entry. Data already exists for this date.");
      return;
    }

    const updatedSteps = [...steps, newEntry];
    updatedSteps.sort((a, b) => {
      const dateA = new Date(a.activity_date);
      const dateB = new Date(b.activity_date);
      return dateB.getTime() - dateA.getTime();
    });
    setSteps(updatedSteps);
    setSelectedDate(new Date());
    setStepInput("");
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setSelectedDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Daily Step Counts</Text>
        <FlatList
          data={steps}
          keyExtractor={(item, idx) => `${item.activity_date}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.date}>
                {new Date(item.activity_date).toLocaleDateString()}
              </Text>
              <Text style={styles.value}>{Math.round(item.metric)} steps</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No step data available.</Text>
          }
        />
        <View style={styles.inputContainer}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Activity Date:</Text>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          </View>
          <TextInput
            style={[styles.input, { marginTop: 16 }]}
            placeholder="Steps"
            value={stepInput}
            onChangeText={setStepInput}
            keyboardType="numeric"
          />
          <Button title="Add Entry" onPress={addStepEntry} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  date: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 32, color: "#888" },
  inputContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  dateLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#333",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: 320,
  },
});
