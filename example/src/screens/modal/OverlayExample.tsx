import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

/**
 * Demonstrates the `overlay` prop.
 *
 * `overlay` renders a visual, NON-interactive layer on top of the sheet
 * content. Touches pass straight through it to the content underneath, so the
 * buttons below keep working while the overlay is visible. Pass a SINGLE node
 * (wrap multiple pieces in one parent View) — the overlay is tracked as one
 * child on the native side.
 *
 * The same overlay works in both presentation modes: modal (default) and
 * inline (`useInlinePresentation: true`). Toggle the switch to verify both.
 */
export const OverlayExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);
  const [inline, setInline] = useState(false);
  const [taps, setTaps] = useState(0);

  const handlePresentPress = useCallback(() => {
    setTaps(0);
    bottomSheetRef.current?.show();
  }, []);

  const handleContentPress = useCallback(() => {
    // Fires even though the overlay is drawn on top — the overlay is
    // pass-through (pointerEvents="none" / userInteractionEnabled = false).
    setTaps((n) => n + 1);
  }, []);

  // A single-node overlay: a translucent banner + a corner badge, wrapped in
  // one parent View with pointerEvents="none" so it never eats touches.
  const overlay = (
    <View pointerEvents="none" style={styles.overlayRoot}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>OVERLAY (visual only)</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>NEW</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        label={`Presentation: ${inline ? 'inline' : 'modal'} (tap to toggle)`}
        onPress={() => setInline((v) => !v)}
      />
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        key={inline ? 'inline' : 'modal'}
        ref={bottomSheetRef}
        overlay={overlay}
        params={{
          maxHeight: 360,
          backgroundColor: 'white',
          topLeftRightCornerRadius: 20,
          useInlinePresentation: inline,
        }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Sheet content</Text>
          <Text style={styles.subtitle}>
            The overlay is drawn above this content but does not block touches.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.tapButton}
            onPress={handleContentPress}
          >
            <Text style={styles.tapButtonText}>Tap me — count: {taps}</Text>
          </TouchableOpacity>
        </View>
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 100,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  tapButton: {
    marginTop: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.75)',
  },
  bannerText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    top: 44,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#16a34a',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});
