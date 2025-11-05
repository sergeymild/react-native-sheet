import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  FittedSheet,
  type FittedSheetRef,
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet,
  presentFittedSheet,
  dismissFittedSheet,
} from 'react-native-sheet';

export default function E2ETestScreen() {
  const basicSheetRef = useRef<FittedSheetRef>(null);
  const nonDismissableSheetRef = useRef<FittedSheetRef>(null);
  const styledSheetRef = useRef<FittedSheetRef>(null);
  const minHeightSheetRef = useRef<FittedSheetRef>(null);
  const maxHeightSheetRef = useRef<FittedSheetRef>(null);
  const [receivedData, setReceivedData] = useState<string>('');

  const openGlobalSheet = () => {
    presentGlobalFittedSheet({
      name: 'g',
      children: (
        <View style={styles.sheetContent} testID="global-sheet-content">
          <Text style={styles.sheetTitle} testID="global-sheet-title">
            Global Sheet
          </Text>
          <Text style={styles.sheetText}>
            This sheet was opened using the global API
          </Text>
          <TouchableOpacity
            testID="close-global-sheet-button"
            style={[styles.button, styles.closeButton]}
            onPress={() => dismissGlobalFittedSheet('g')}
          >
            <Text style={styles.buttonText}>Close Global Sheet</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const openNamedSheet = () => {
    presentFittedSheet('testSheet', {
      message: 'Hello from named sheet',
      timestamp: Date.now(),
    });
  };

  const openDataSheet = () => {
    basicSheetRef.current?.show({
      title: 'Data Passed',
      message: 'This data was passed to the sheet',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>E2E Test Screen</Text>
      <Text style={styles.subtitle}>
        This screen is used for Detox E2E testing
      </Text>

      {/* Basic Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Sheet</Text>
        <TouchableOpacity
          testID="open-basic-sheet-button"
          style={styles.button}
          onPress={() => basicSheetRef.current?.show()}
        >
          <Text style={styles.buttonText}>Open Basic Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Data Passing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Passing</Text>
        <TouchableOpacity
          testID="open-data-sheet-button"
          style={styles.button}
          onPress={openDataSheet}
        >
          <Text style={styles.buttonText}>Open Sheet with Data</Text>
        </TouchableOpacity>
        {receivedData && (
          <Text testID="received-data-text" style={styles.dataText}>
            {receivedData}
          </Text>
        )}
      </View>

      {/* Non-Dismissable Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Non-Dismissable Sheet</Text>
        <TouchableOpacity
          testID="open-non-dismissable-sheet-button"
          style={styles.button}
          onPress={() => nonDismissableSheetRef.current?.show()}
        >
          <Text style={styles.buttonText}>Open Non-Dismissable</Text>
        </TouchableOpacity>
      </View>

      {/* Global Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Global Sheet API</Text>
        <TouchableOpacity
          testID="open-global-sheet-button"
          style={styles.button}
          onPress={openGlobalSheet}
        >
          <Text style={styles.buttonText}>Open Global Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Named Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Named Sheet API</Text>
        <TouchableOpacity
          testID="open-named-sheet-button"
          style={styles.button}
          onPress={openNamedSheet}
        >
          <Text style={styles.buttonText}>Open Named Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Styled Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Styling</Text>
        <TouchableOpacity
          testID="open-styled-sheet-button"
          style={styles.button}
          onPress={() => styledSheetRef.current?.show()}
        >
          <Text style={styles.buttonText}>Open Styled Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Min Height Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Min Height Constraint</Text>
        <TouchableOpacity
          testID="open-min-height-sheet-button"
          style={styles.button}
          onPress={() => minHeightSheetRef.current?.show()}
        >
          <Text style={styles.buttonText}>Open Min Height Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Max Height Sheet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Max Height Constraint</Text>
        <TouchableOpacity
          testID="open-max-height-sheet-button"
          style={styles.button}
          onPress={() => maxHeightSheetRef.current?.show()}
        >
          <Text style={styles.buttonText}>Open Max Height Sheet</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Sheet */}
      <FittedSheet ref={basicSheetRef}>
        {(data: any) => (
          <View style={styles.sheetContent} testID="basic-sheet-content">
            <Text style={styles.sheetTitle} testID="basic-sheet-title">
              {data?.title || 'Bottom Sheet'}
            </Text>
            <Text style={styles.sheetText}>
              {data?.message || 'This is a basic bottom sheet'}
            </Text>
            <Text style={styles.sheetText}>Can be closed by:</Text>
            <Text style={styles.sheetText}>• Swiping down</Text>
            <Text style={styles.sheetText}>• Tapping the backdrop</Text>
            <Text style={styles.sheetText}>• Pressing the close button</Text>

            {data && (
              <TouchableOpacity
                testID="save-data-button"
                style={[styles.button, styles.saveButton]}
                onPress={() => {
                  setReceivedData(JSON.stringify(data));
                  basicSheetRef.current?.hide();
                }}
              >
                <Text style={styles.buttonText}>Save Data & Close</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              testID="close-basic-sheet-button"
              style={[styles.button, styles.closeButton]}
              onPress={() => basicSheetRef.current?.hide()}
            >
              <Text style={styles.buttonText}>Close Sheet</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.scrollContent}
              testID="basic-sheet-scroll-view"
            >
              {Array.from({ length: 20 }, (_, i) => (
                <Text
                  key={i}
                  style={styles.listItem}
                  testID={`scroll-item-${i}`}
                >
                  Item {i + 1}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </FittedSheet>

      {/* Non-Dismissable Sheet */}
      <FittedSheet ref={nonDismissableSheetRef} params={{ dismissable: false }}>
        <View
          style={styles.sheetContent}
          testID="non-dismissable-sheet-content"
        >
          <Text style={styles.sheetTitle} testID="non-dismissable-sheet-title">
            Non-Dismissable Sheet
          </Text>
          <Text style={styles.sheetText}>
            This sheet cannot be dismissed by:
          </Text>
          <Text style={styles.sheetText}>• Swiping down (disabled)</Text>
          <Text style={styles.sheetText}>
            • Tapping the backdrop (disabled)
          </Text>
          <Text style={styles.sheetText}>Only the close button will work:</Text>

          <TouchableOpacity
            testID="close-non-dismissable-sheet-button"
            style={[styles.button, styles.closeButton]}
            onPress={() => nonDismissableSheetRef.current?.hide()}
          >
            <Text style={styles.buttonText}>Close Sheet</Text>
          </TouchableOpacity>
        </View>
      </FittedSheet>

      {/* Named Sheet */}
      <FittedSheet name="testSheet">
        {(data: any) => (
          <View style={styles.sheetContent} testID="named-sheet-content">
            <Text style={styles.sheetTitle} testID="named-sheet-title">
              Named Sheet: testSheet
            </Text>
            <Text style={styles.sheetText} testID="named-sheet-message">
              {data?.message || 'No message'}
            </Text>
            <Text style={styles.sheetText} testID="named-sheet-timestamp">
              Timestamp: {data?.timestamp || 'N/A'}
            </Text>

            <TouchableOpacity
              testID="close-named-sheet-button"
              style={[styles.button, styles.closeButton]}
              onPress={() => dismissFittedSheet('testSheet')}
            >
              <Text style={styles.buttonText}>Close Named Sheet</Text>
            </TouchableOpacity>
          </View>
        )}
      </FittedSheet>

      {/* Styled Sheet */}
      <FittedSheet
        ref={styledSheetRef}
        params={{
          backgroundColor: '#FF6B6B',
          topLeftRightCornerRadius: 30,
        }}
      >
        <View style={styles.sheetContent} testID="styled-sheet-content">
          <Text
            style={[styles.sheetTitle, { color: '#fff' }]}
            testID="styled-sheet-title"
          >
            Styled Sheet
          </Text>
          <Text
            style={[styles.sheetText, { color: '#fff' }]}
            testID="styled-sheet-description"
          >
            This sheet has custom styling:
          </Text>
          <Text style={[styles.sheetText, { color: '#fff' }]}>
            • Red background (#FF6B6B)
          </Text>
          <Text style={[styles.sheetText, { color: '#fff' }]}>
            • 30px corner radius
          </Text>

          <TouchableOpacity
            testID="close-styled-sheet-button"
            style={[styles.button, { backgroundColor: '#fff' }]}
            onPress={() => styledSheetRef.current?.hide()}
          >
            <Text style={[styles.buttonText, { color: '#FF6B6B' }]}>
              Close Sheet
            </Text>
          </TouchableOpacity>
        </View>
      </FittedSheet>

      {/* Min Height Sheet */}
      <FittedSheet ref={minHeightSheetRef} params={{ minHeight: 400 }}>
        <View style={styles.sheetContent} testID="min-height-sheet-content">
          <Text style={styles.sheetTitle} testID="min-height-sheet-title">
            Min Height Sheet
          </Text>
          <Text style={styles.sheetText}>
            This sheet has a minimum height of 400px
          </Text>
          <Text style={styles.sheetText}>
            Even with little content, it maintains this height.
          </Text>

          <TouchableOpacity
            testID="close-min-height-sheet-button"
            style={[styles.button, styles.closeButton]}
            onPress={() => minHeightSheetRef.current?.hide()}
          >
            <Text style={styles.buttonText}>Close Sheet</Text>
          </TouchableOpacity>
        </View>
      </FittedSheet>

      {/* Max Height Sheet */}
      <FittedSheet ref={maxHeightSheetRef} params={{ maxHeight: 300 }}>
        <View style={styles.sheetContent} testID="max-height-sheet-content">
          <Text style={styles.sheetTitle} testID="max-height-sheet-title">
            Max Height Sheet
          </Text>
          <Text style={styles.sheetText}>
            This sheet has a maximum height of 300px
          </Text>

          <ScrollView style={styles.scrollContent}>
            {Array.from({ length: 30 }, (_, i) => (
              <Text key={i} style={styles.listItem}>
                Long content item {i + 1}
              </Text>
            ))}
          </ScrollView>

          <TouchableOpacity
            testID="close-max-height-sheet-button"
            style={[styles.button, styles.closeButton]}
            onPress={() => maxHeightSheetRef.current?.hide()}
          >
            <Text style={styles.buttonText}>Close Sheet</Text>
          </TouchableOpacity>
        </View>
      </FittedSheet>
    </ScrollView>
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
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
  saveButton: {
    marginTop: 16,
    backgroundColor: '#34C759',
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
  dataText: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
  },
});
