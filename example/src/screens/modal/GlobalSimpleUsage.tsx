import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/button';
import {
  dismissGlobalFittedSheet,
  presentGlobalFittedSheet,
  attachScrollViewToGlobalFittedSheet,
} from 'react-native-sheet';

// Component with dynamic ScrollView loading
const DynamicScrollViewSheet: React.FC<{ sheetName: string }> = ({
  sheetName,
}) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<number[]>([]);

  useEffect(() => {
    console.log(`[DynamicScrollViewSheet] ${sheetName} - starting load`);
    // Simulate async data loading
    setTimeout(() => {
      console.log(`[DynamicScrollViewSheet] ${sheetName} - data loaded`);
      setItems(Array.from({ length: 20 }, (_, i) => i + 1));
      setLoading(false);

      // Re-attach ScrollView after it appears
      setTimeout(() => {
        console.log(
          `[DynamicScrollViewSheet] ${sheetName} - attaching ScrollView`
        );
        const result = attachScrollViewToGlobalFittedSheet(sheetName);
        console.log(
          `[DynamicScrollViewSheet] ${sheetName} - attach result:`,
          result
        );
      }, 100);
    }, 2000); // 2 second delay
  }, [sheetName]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loaderText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContent}>
      <Text style={styles.sheetTitle}>Dynamic ScrollView Sheet</Text>
      <Text style={styles.subtitle}>
        ScrollView was attached after loading!
      </Text>
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <Text>Item {item}</Text>
        </View>
      ))}
      <Button
        label="Dismiss"
        onPress={() => dismissGlobalFittedSheet(sheetName)}
      />
    </ScrollView>
  );
};

export const GlobalSimpleUsage: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Global Sheet Testing</Text>

      <Text style={styles.sectionTitle}>Basic Tests:</Text>

      <Button
        label="Present Global Sheet 1"
        onPress={() => {
          console.log('\n=== TEST: Present Sheet 1 ===');
          presentGlobalFittedSheet?.({
            name: 'globalSheet1',
            onDismiss: () => {
              console.log('[GlobalSimpleUsage.onDismiss] globalSheet1');
            },
            sheetProps: {
              params: {
                backgroundColor: 'white',
                topLeftRightCornerRadius: 10,
              },
              rootViewStyle: {
                paddingBottom: 56,
              },
            },
            children: (
              <View style={{ flexGrow: 1, padding: 20 }}>
                <Text style={styles.sheetTitle}>Sheet 1</Text>
                <Button
                  label="Dismiss This Sheet"
                  onPress={() => {
                    console.log(
                      '\n=== TEST: Dismiss Sheet 1 (from inside) ==='
                    );
                    dismissGlobalFittedSheet('globalSheet1');
                  }}
                />
                <Button
                  label="Present Global Sheet 2"
                  onPress={() => {
                    console.log('\n=== TEST: Present Sheet 2 ===');
                    presentGlobalFittedSheet?.({
                      name: 'globalSheet2',
                      onDismiss: () => {
                        console.log(
                          '[GlobalSimpleUsage.onDismiss] globalSheet2'
                        );
                      },
                      sheetProps: {
                        params: {
                          backgroundColor: 'lightblue',
                          topLeftRightCornerRadius: 10,
                        },
                        rootViewStyle: {
                          paddingBottom: 56,
                        },
                      },
                      children: (
                        <View style={{ flexGrow: 1, padding: 20 }}>
                          <Text style={styles.sheetTitle}>Sheet 2</Text>
                          <Button
                            label="Dismiss This Sheet"
                            onPress={() => {
                              console.log(
                                '\n=== TEST: Dismiss Sheet 2 (from inside) ==='
                              );
                              dismissGlobalFittedSheet('globalSheet2');
                            }}
                          />
                          <Button
                            label="Dismiss Sheet 1"
                            onPress={() => {
                              console.log(
                                '\n=== TEST: Dismiss Sheet 1 (from sheet 2) ==='
                              );
                              dismissGlobalFittedSheet('globalSheet1');
                            }}
                          />
                          <Button
                            label="Present Global Sheet 3"
                            onPress={() => {
                              console.log('\n=== TEST: Present Sheet 3 ===');
                              presentGlobalFittedSheet?.({
                                name: 'globalSheet3',
                                onDismiss: () => {
                                  console.log(
                                    '[GlobalSimpleUsage.onDismiss] globalSheet3'
                                  );
                                },
                                sheetProps: {
                                  params: {
                                    backgroundColor: 'lightgreen',
                                    topLeftRightCornerRadius: 10,
                                  },
                                  rootViewStyle: {
                                    paddingBottom: 56,
                                  },
                                },
                                children: (
                                  <View style={{ flexGrow: 1, padding: 20 }}>
                                    <Text style={styles.sheetTitle}>
                                      Sheet 3
                                    </Text>
                                    <Button
                                      label="Dismiss This Sheet"
                                      onPress={() => {
                                        console.log(
                                          '\n=== TEST: Dismiss Sheet 3 (from inside) ==='
                                        );
                                        dismissGlobalFittedSheet(
                                          'globalSheet3'
                                        );
                                      }}
                                    />
                                    <Button
                                      label="Dismiss Sheet 2"
                                      onPress={() => {
                                        console.log(
                                          '\n=== TEST: Dismiss Sheet 2 (from sheet 3) ==='
                                        );
                                        dismissGlobalFittedSheet(
                                          'globalSheet2'
                                        );
                                      }}
                                    />
                                    <Button
                                      label="Dismiss Sheet 1"
                                      onPress={() => {
                                        console.log(
                                          '\n=== TEST: Dismiss Sheet 1 (from sheet 3) ==='
                                        );
                                        dismissGlobalFittedSheet(
                                          'globalSheet1'
                                        );
                                      }}
                                    />
                                    <Button
                                      label="Dismiss All"
                                      onPress={() => {
                                        console.log(
                                          '\n=== TEST: Dismiss All (from sheet 3) ==='
                                        );
                                        dismissGlobalFittedSheet(
                                          'globalSheet1'
                                        );
                                        dismissGlobalFittedSheet(
                                          'globalSheet2'
                                        );
                                        dismissGlobalFittedSheet(
                                          'globalSheet3'
                                        );
                                      }}
                                    />
                                  </View>
                                ),
                              });
                            }}
                          />
                        </View>
                      ),
                    });
                  }}
                />
              </View>
            ),
          });
        }}
      />

      <Text style={styles.sectionTitle}>Dismiss Tests:</Text>

      <Button
        label="Dismiss Sheet 1"
        onPress={() => {
          console.log('\n=== TEST: Dismiss Sheet 1 ===');
          dismissGlobalFittedSheet('globalSheet1');
        }}
      />

      <Button
        label="Dismiss Sheet 2"
        onPress={() => {
          console.log('\n=== TEST: Dismiss Sheet 2 ===');
          dismissGlobalFittedSheet('globalSheet2');
        }}
      />

      <Button
        label="Dismiss Sheet 3"
        onPress={() => {
          console.log('\n=== TEST: Dismiss Sheet 3 ===');
          dismissGlobalFittedSheet('globalSheet3');
        }}
      />

      <Button
        label="Dismiss All (1,2,3)"
        onPress={() => {
          console.log('\n=== TEST: Dismiss All Sheets ===');
          dismissGlobalFittedSheet('globalSheet1');
          dismissGlobalFittedSheet('globalSheet2');
          dismissGlobalFittedSheet('globalSheet3');
        }}
      />

      <Text style={styles.sectionTitle}>Memory Leak Tests:</Text>

      <Button
        label="Spam 10 Sheets (same name)"
        onPress={() => {
          console.log('\n=== TEST: Spam 10 sheets with same name ===');
          for (let i = 0; i < 10; i++) {
            presentGlobalFittedSheet?.({
              name: 'spamSheet',
              children: (
                <View style={{ padding: 20 }}>
                  <Text>Spam iteration {i}</Text>

                  <Button
                    label="Dismiss"
                    onPress={() => {
                      dismissGlobalFittedSheet('spamSheet');
                    }}
                  />
                </View>
              ),
            });
          }
        }}
      />

      <Button
        label="Create 5 Different Sheets"
        onPress={() => {
          console.log('\n=== TEST: Create 5 different sheets ===');
          ['test1', 'test2', 'test3', 'test4', 'test5'].forEach((name, i) => {
            presentGlobalFittedSheet?.({
              name,
              sheetProps: {
                params: {
                  backgroundColor: [
                    'white',
                    'lightblue',
                    'lightgreen',
                    'lightyellow',
                    'lightpink',
                  ][i],
                },
              },
              children: (
                <View style={{ padding: 20 }}>
                  <Text style={styles.sheetTitle}>{name}</Text>
                </View>
              ),
            });
          });
        }}
      />

      <Button
        label="Dismiss Non-existent Sheet"
        onPress={() => {
          console.log('\n=== TEST: Dismiss non-existent sheet ===');
          dismissGlobalFittedSheet('nonExistent');
        }}
      />

      <Text style={styles.sectionTitle}>ScrollView Tests:</Text>

      <Button
        label="Dynamic ScrollView Sheet"
        onPress={() => {
          console.log('\n=== TEST: Dynamic ScrollView Sheet ===');
          presentGlobalFittedSheet({
            name: 'dynamicScrollSheet',
            onDismiss: () => {
              console.log('[GlobalSimpleUsage.onDismiss] dynamicScrollSheet');
            },
            sheetProps: {
              params: {
                backgroundColor: 'white',
                topLeftRightCornerRadius: 10,
              },
            },
            children: <DynamicScrollViewSheet sheetName="dynamicScrollSheet" />,
          });
        }}
      />

      <Button
        label="Attach ScrollView to test1"
        onPress={() => {
          console.log('\n=== TEST: Attach ScrollView to test1 ===');
          const result = attachScrollViewToGlobalFittedSheet('test1');
          console.log('Result:', result);
        }}
      />

      <Button
        label="Attach ScrollView to non-existent"
        onPress={() => {
          console.log('\n=== TEST: Attach ScrollView to non-existent ===');
          const result = attachScrollViewToGlobalFittedSheet('nonExistent');
          console.log('Result:', result);
        }}
      />

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#666',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
