import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { SheetProvider } from '../index';

describe('SheetProvider', () => {
  it('should render without crashing', () => {
    const { getByText } = render(
      <SheetProvider>
        <View>
          <Text>Test Content</Text>
        </View>
      </SheetProvider>
    );
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should render children', () => {
    const { getByText } = render(
      <SheetProvider>
        <View>
          <Text>Provider Children</Text>
        </View>
      </SheetProvider>
    );
    expect(getByText('Provider Children')).toBeTruthy();
  });

  it('should render without global sheet view by default', () => {
    const { getByText } = render(
      <SheetProvider>
        <View>
          <Text>Content</Text>
        </View>
      </SheetProvider>
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('should render with global sheet view when enabled', () => {
    const { getByText } = render(
      <SheetProvider addGlobalSheetView>
        <View>
          <Text>Content with Global</Text>
        </View>
      </SheetProvider>
    );
    expect(getByText('Content with Global')).toBeTruthy();
  });

  it('should pass global sheet props', () => {
    const { getByText } = render(
      <SheetProvider
        addGlobalSheetView
        globalSheetProps={{
          params: {
            backgroundColor: 'blue',
            topLeftRightCornerRadius: 20,
          },
        }}
      >
        <View>
          <Text>Content</Text>
        </View>
      </SheetProvider>
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('should support nested children', () => {
    const { getByText } = render(
      <SheetProvider>
        <View>
          <View>
            <View>
              <Text>Nested Content</Text>
            </View>
          </View>
        </View>
      </SheetProvider>
    );
    expect(getByText('Nested Content')).toBeTruthy();
  });

  it('should support multiple children', () => {
    const { getByText } = render(
      <SheetProvider>
        <View>
          <Text>Child 1</Text>
        </View>
        <View>
          <Text>Child 2</Text>
        </View>
        <View>
          <Text>Child 3</Text>
        </View>
      </SheetProvider>
    );
    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
    expect(getByText('Child 3')).toBeTruthy();
  });
});
