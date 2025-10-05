import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type StepData = {
  activityDate: string;
  value: number;
};

function generateMockSteps(): StepData[] {
  const steps: StepData[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    steps.push({
      activityDate: date.toLocaleDateString(),
      value: Math.floor(Math.random() * 10000) + 1000, // Random steps between 1000 and 11000
    });
  }
  return steps;
}

export default function HealthScreen() {
  const [steps, setSteps] = useState<StepData[]>([]);
  const [stepInput, setStepInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    setSteps(generateMockSteps());
  }, []);

  const addStepEntry = () => {
    if (!selectedDate || !stepInput) return;
    const newEntry: StepData = {
      activityDate: selectedDate.toLocaleDateString(),
      value: parseInt(stepInput, 10),
    };
    const updatedSteps = [newEntry, ...steps];
    updatedSteps.sort((a, b) => {
      const dateA = new Date(a.activityDate);
      const dateB = new Date(b.activityDate);
      return dateB.getTime() - dateA.getTime();
    });
    setSteps(updatedSteps);
    setSelectedDate(new Date());
    setStepInput('');
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setSelectedDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Daily Step Counts</Text>
        <FlatList
          data={steps}
          keyExtractor={(item, idx) => `${item.activityDate}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.date}>
                {item.activityDate}
              </Text>
              <Text style={styles.value}>{item.value} steps</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  date: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' },
  inputContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  dateLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 320,
  },
});