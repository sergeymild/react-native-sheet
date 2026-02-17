import { useCallback, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

const messages = [
  'Hey, how are you?',
  'I am fine, thanks!',
  'What are you doing today?',
  'Working on a React Native project',
  'That sounds cool!',
  'Yeah, fixing some bottom sheet issues',
  'What kind of issues?',
  'Inverted list was closing the sheet in the wrong direction',
  'Oh that is annoying',
  'Fixed it now!',
  'Great job!',
  'Thanks! Want to grab lunch?',
  'Sure, where?',
  'How about that new place downtown?',
  'Sounds good, see you at 12',
  'Perfect!',
  'By the way, did you see the new update?',
  'Not yet, what changed?',
  'They added dark mode support',
  'Finally! I have been waiting for that',
  'Me too, it looks really nice',
  'I will check it out later',
  'Let me know what you think',
  'Will do!',
  'Also, the meeting got moved to 3pm',
  'Thanks for letting me know',
  'No problem',
  'See you later!',
  'Bye!',
  'Take care!',
];

const keyExtractor = (_: any, index: number) => index.toString();

export const InvertedListExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  const data = useMemo(
    () => messages.map((text, i) => ({ id: i, text, isMe: i % 3 === 0 })),
    []
  );

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  const renderItem = useCallback(({ item }: { item: (typeof data)[0] }) => {
    return (
      <View
        style={[
          styles.bubble,
          item.isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        <Text style={item.isMe ? styles.textMe : styles.textOther}>
          {item.text}
        </Text>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present Inverted List" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{
          backgroundColor: '#f5f5f5',
          topLeftRightCornerRadius: 16,
        }}
      >
        <Text style={styles.header}>Chat (inverted FlatList)</Text>
        <FlatList
          inverted
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 3,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  textMe: {
    color: 'white',
    fontSize: 15,
  },
  textOther: {
    color: 'black',
    fontSize: 15,
  },
});
