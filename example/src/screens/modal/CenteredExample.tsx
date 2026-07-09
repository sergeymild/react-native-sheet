import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

/**
 * Demonstrates `presentationStyle: 'center'` — the sheet floats in the vertical
 * center as a dialog card, the whole screen is dimmed, and it is dismissed by
 * swiping down or tapping the dim. Toggle the placement and the enter animation.
 */
export const CenteredExample = () => {
  const sheetRef = useRef<FittedSheetRef>(null);
  const [centered, setCentered] = useState(true);
  const [animation, setAnimation] = useState<'fade' | 'slide'>('fade');

  return (
    <View style={styles.container}>
      <Button
        label={`Placement: ${centered ? 'center' : 'bottom'} (tap to toggle)`}
        onPress={() => setCentered((v) => !v)}
      />
      <Button
        label={`Center animation: ${animation} (tap to toggle)`}
        onPress={() => setAnimation((a) => (a === 'fade' ? 'slide' : 'fade'))}
      />
      <Button label="Present" onPress={() => sheetRef.current?.show()} />

      <FittedSheet
        key={`${centered}-${animation}`}
        ref={sheetRef}
        params={{
          maxHeight: 360,
          maxPortraitWidth: 420,
          maxLandscapeWidth: 420,
          backgroundColor: 'white',
          topLeftRightCornerRadius: 20,
          presentationStyle: centered ? 'center' : 'bottom',
          centerAnimation: animation,
        }}
        rootViewStyle={styles.sheetRoot}
      >
        <View style={styles.content}>
          <View style={styles.handle} />
          <Text style={styles.title}>Centered dialog</Text>
          <Text style={styles.subtitle}>
            Swipe down or tap the dimmed background to dismiss.
          </Text>
          <Button label="Close" onPress={() => sheetRef.current?.hide()} />
        </View>
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 100, gap: 12 },
  sheetRoot: { borderRadius: 20, overflow: 'hidden' },
  content: { padding: 24, gap: 16, alignItems: 'stretch' },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center' },
});
