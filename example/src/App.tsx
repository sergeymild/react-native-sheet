import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { screens } from './screens';
import { useEffect, useState } from 'react';

const Buttons = (props: { onSelect: (name: string) => void }) => {
  return (
    <>
      <ScrollView>
        {screens.map((screen, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              props.onSelect(screen.name);
            }}
          >
            <Text children={screen.slug} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

export default function App() {
  const [screen, setScreen] = useState<string | undefined>(undefined);
  return (
    <View style={styles.container}>
      <Buttons onSelect={setScreen} />
      {!!screen && (
        <View
          style={{ flex: 1 }}
          children={screens.find((s) => s.name === screen)?.getScreen()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    flexGrow: 1,
  },
});
