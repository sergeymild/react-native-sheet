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
        label="Present Global Sheet 1"
        onPress={() => {
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
              <View style={{ flexGrow: 1 }}>
                <Text children={'Text in sheet 1'} />
                <Button
                  label="Present Global Sheet 2"
                  onPress={() => {
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
                        <View style={{ flexGrow: 1 }}>
                          <Text children={'Text in sheet 2'} />
                          <Button
                            label="Present Global Sheet 3"
                            onPress={() => {
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
                                  <View style={{ flexGrow: 1 }}>
                                    <Text children={'Text in sheet 3'} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
