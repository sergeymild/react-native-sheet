import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/button';
import {
  FittedSheet,
  presentFittedSheet,
  presentGlobalFittedSheet,
} from 'react-native-sheet';

export const GlobalSimpleUsage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Button
        label="Present"
        onPress={() => {
          presentGlobalFittedSheet?.({
            onDismiss: () => {
              console.log('[GlobalSimpleUsage.onDismiss]');
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
              <View style={{ flexGrow: 1 }}>
                <Text children={'Text in sheet'} />
                <TouchableOpacity
                  onPress={() => presentFittedSheet('secondSheet')}
                >
                  <Text children={'Present another one'} />
                </TouchableOpacity>
              </View>
            ),
          });
        }}
      />

      <FittedSheet
        name={'secondSheet'}
        params={{ minHeight: 300, backgroundColor: 'yellow' }}
      >
        <View style={{ flexGrow: 1 }}>
          <Text children={'Second Sheet on top of global'} />
        </View>
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
