import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

export const DataPassingUsage: React.FC = () => {
  const basicSheetRef = useRef<FittedSheetRef>(null);
  const resultSheetRef = useRef<FittedSheetRef>(null);
  const complexSheetRef = useRef<FittedSheetRef>(null);
  const formSheetRef = useRef<FittedSheetRef>(null);

  const [lastResult, setLastResult] = useState<any>(null);
  const [lastFormData, setLastFormData] = useState<any>(null);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Data Passing Examples</Text>
      <Text style={styles.description}>
        Examples of passing data with show(data) and returning values with
        hide(returnValue)
      </Text>

      {/* Basic Data Passing */}
      <Text style={styles.sectionTitle}>1. Basic Data Passing</Text>
      <Text style={styles.sectionDescription}>
        Pass data to sheet using show(data)
      </Text>

      <Button
        label="Show Sheet with User Data"
        onPress={() => {
          console.log('\n=== TEST: Basic Data Passing ===');
          basicSheetRef.current?.show({
            userId: 42,
            userName: 'John Doe',
            email: 'john@example.com',
            role: 'Developer',
          });
        }}
      />

      <FittedSheet
        ref={basicSheetRef}
        params={{
          backgroundColor: 'white',
          topLeftRightCornerRadius: 16,
        }}
      >
        {(data) => (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>User Profile</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{data?.userId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{data?.userName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{data?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{data?.role}</Text>
            </View>
            <Button
              label="Close"
              onPress={() => basicSheetRef.current?.hide()}
            />
          </View>
        )}
      </FittedSheet>

      {/* Return Data with hide */}
      <Text style={styles.sectionTitle}>2. Return Data with hide()</Text>
      <Text style={styles.sectionDescription}>
        Return values when closing the sheet
      </Text>

      <Button
        label="Show Confirmation Dialog"
        onPress={() => {
          console.log('\n=== TEST: Return Data ===');
          resultSheetRef.current?.show();
        }}
      />

      {lastResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Last Result:</Text>
          <Text style={styles.resultText}>
            Action: {lastResult.action || 'none'}
          </Text>
          <Text style={styles.resultText}>
            Timestamp: {new Date(lastResult.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <FittedSheet
        ref={resultSheetRef}
        params={{
          backgroundColor: 'white',
          topLeftRightCornerRadius: 16,
        }}
        onSheetDismiss={(returnValue) => {
          console.log('Sheet dismissed with value:', returnValue);
          if (returnValue) {
            setLastResult(returnValue);
          }
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Confirm Action</Text>
          <Text style={styles.questionText}>
            Do you want to proceed with this action?
          </Text>
          <Button
            label="✅ Confirm"
            onPress={() => {
              resultSheetRef.current?.hide({
                action: 'confirmed',
                timestamp: Date.now(),
              });
            }}
          />
          <Button
            label="❌ Cancel"
            onPress={() => {
              resultSheetRef.current?.hide({
                action: 'cancelled',
                timestamp: Date.now(),
              });
            }}
          />
          <Button
            label="⏭️ Skip"
            onPress={() => {
              resultSheetRef.current?.hide({
                action: 'skipped',
                timestamp: Date.now(),
              });
            }}
          />
        </View>
      </FittedSheet>

      {/* Complex: Pass and Return Data */}
      <Text style={styles.sectionTitle}>
        3. Pass Data In + Return Data Out
      </Text>
      <Text style={styles.sectionDescription}>
        Combine both patterns: receive data via show() and return via hide()
      </Text>

      <Button
        label="Edit Product Details"
        onPress={() => {
          console.log('\n=== TEST: Complex Data Flow ===');
          complexSheetRef.current?.show({
            productId: 'PROD-123',
            productName: 'MacBook Pro',
            price: 2499,
            inStock: true,
          });
        }}
      />

      <FittedSheet
        ref={complexSheetRef}
        params={{
          backgroundColor: 'white',
          topLeftRightCornerRadius: 16,
          maxHeight: 500,
        }}
        onSheetDismiss={(returnValue) => {
          if (returnValue?.saved) {
            console.log('Product updated:', returnValue);
            setLastResult({
              action: 'product_updated',
              data: returnValue,
              timestamp: Date.now(),
            });
          }
        }}
      >
        {(data) => (
          <ProductEditContent sheetRef={complexSheetRef} data={data} />
        )}
      </FittedSheet>

      {/* Form Example */}
      <Text style={styles.sectionTitle}>4. Form with Validation</Text>
      <Text style={styles.sectionDescription}>
        Create a form that returns validated data
      </Text>

      <Button
        label="Create New User"
        onPress={() => {
          console.log('\n=== TEST: Form Example ===');
          formSheetRef.current?.show();
        }}
      />

      {lastFormData && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Created User:</Text>
          <Text style={styles.resultText}>Name: {lastFormData.name}</Text>
          <Text style={styles.resultText}>Email: {lastFormData.email}</Text>
          <Text style={styles.resultText}>Age: {lastFormData.age}</Text>
        </View>
      )}

      <FittedSheet
        ref={formSheetRef}
        params={{
          backgroundColor: 'white',
          topLeftRightCornerRadius: 16,
          maxHeight: 600,
        }}
        onSheetDismiss={(returnValue) => {
          if (returnValue?.submitted) {
            console.log('Form submitted:', returnValue.data);
            setLastFormData(returnValue.data);
          } else {
            console.log('Form cancelled');
          }
        }}
      >
        <FormContent sheetRef={formSheetRef} />
      </FittedSheet>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

// Separate component for product editing to properly use hooks
const ProductEditContent: React.FC<{
  sheetRef: React.RefObject<FittedSheetRef>;
  data: any;
}> = ({ sheetRef, data }) => {
  const [price, setPrice] = useState(data?.price?.toString() || '');
  const [inStock, setInStock] = useState(data?.inStock || false);

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>Edit Product</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>ID:</Text>
        <Text style={styles.infoValue}>{data?.productId}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Name:</Text>
        <Text style={styles.infoValue}>{data?.productName}</Text>
      </View>

      <Text style={styles.inputLabel}>Price:</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholder="Enter price"
      />

      <View style={styles.checkboxRow}>
        <Text style={styles.inputLabel}>In Stock:</Text>
        <Button
          label={inStock ? '✓ Yes' : '✗ No'}
          onPress={() => setInStock(!inStock)}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          label="💾 Save"
          onPress={() => {
            sheetRef.current?.hide({
              saved: true,
              productId: data?.productId,
              productName: data?.productName,
              price: parseFloat(price),
              inStock,
            });
          }}
        />
        <Button
          label="Cancel"
          onPress={() => {
            sheetRef.current?.hide({ saved: false });
          }}
        />
      </View>
    </View>
  );
};

// Separate component for form to properly use hooks
const FormContent: React.FC<{ sheetRef: React.RefObject<FittedSheetRef> }> = ({
  sheetRef,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(age)) || Number(age) < 1) {
      newErrors.age = 'Age must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      sheetRef.current?.hide({
        submitted: true,
        data: {
          name: name.trim(),
          email: email.trim(),
          age: Number(age),
          createdAt: new Date().toISOString(),
        },
      });
      // Reset form
      setName('');
      setEmail('');
      setAge('');
      setErrors({});
    }
  };

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>New User Form</Text>

      <Text style={styles.inputLabel}>Name:</Text>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) {
            setErrors((prev) => ({ ...prev, name: '' }));
          }
        }}
        placeholder="Enter name"
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.inputLabel}>Email:</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) {
            setErrors((prev) => ({ ...prev, email: '' }));
          }
        }}
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.inputLabel}>Age:</Text>
      <TextInput
        style={[styles.input, errors.age && styles.inputError]}
        value={age}
        onChangeText={(text) => {
          setAge(text);
          if (errors.age) {
            setErrors((prev) => ({ ...prev, age: '' }));
          }
        }}
        placeholder="Enter age"
        keyboardType="numeric"
      />
      {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

      <View style={styles.buttonRow}>
        <Button label="✓ Submit" onPress={handleSubmit} />
        <Button
          label="Cancel"
          onPress={() => {
            sheetRef.current?.hide({ submitted: false });
            setName('');
            setEmail('');
            setAge('');
            setErrors({});
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  sheetContent: {
    padding: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
    lineHeight: 24,
  },
  resultBox: {
    marginTop: 12,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2e7d32',
  },
  resultText: {
    fontSize: 13,
    color: '#388e3c',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  bottomSpacer: {
    height: 50,
  },
});