import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

export default function E2ETestScreen() {
  const sheetRef = useRef<FittedSheetRef>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>E2E Test Screen</Text>
      <Text style={styles.subtitle}>
        This screen is used for Detox E2E testing
      </Text>

      <TouchableOpacity
        testID="open-sheet-button"
        style={styles.button}
        onPress={() => sheetRef.current?.show()}
      >
        <Text style={styles.buttonText}>Open Sheet</Text>
      </TouchableOpacity>

      <FittedSheet ref={sheetRef}>
        <View style={styles.sheetContent} testID="sheet-content">
          <Text style={styles.sheetTitle} testID="sheet-title">
            Bottom Sheet
          </Text>
          <Text style={styles.sheetText}>
            This is a bottom sheet that can be closed by:
          </Text>
          <Text style={styles.sheetText}>• Swiping down</Text>
          <Text style={styles.sheetText}>• Tapping the backdrop</Text>
          <Text style={styles.sheetText}>• Pressing the close button</Text>

          <TouchableOpacity
            testID="close-sheet-button"
            style={[styles.button, styles.closeButton]}
            onPress={() => sheetRef.current?.hide()}
          >
            <Text style={styles.buttonText}>Close Sheet</Text>
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollContent}
            testID="sheet-scroll-view"
          >
            {Array.from({ length: 20 }, (_, i) => (
              <Text key={i} style={styles.listItem}>
                Item {i + 1}
              </Text>
            ))}
          </ScrollView>
        </View>
      </FittedSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sheetContent: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sheetText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF3B30',
  },
  scrollContent: {
    marginTop: 20,
    maxHeight: 200,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});