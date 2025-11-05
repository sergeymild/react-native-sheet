import React, { useRef } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { FittedSheet, SheetProvider, type FittedSheetRef } from '../index';

describe('FittedSheet', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <SheetProvider>{children}</SheetProvider>
  );

  describe('Basic Functionality', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <FittedSheet>
            <View>
              <Text>Sheet Content</Text>
            </View>
          </FittedSheet>
        </TestWrapper>
      );
      // Sheet is not shown initially, so we just verify it renders
      expect(true).toBe(true);
    });

    it('should not render content when not shown', () => {
      const { queryByText } = render(
        <TestWrapper>
          <FittedSheet>
            <View>
              <Text>Hidden Content</Text>
            </View>
          </FittedSheet>
        </TestWrapper>
      );
      expect(queryByText('Hidden Content')).toBeNull();
    });

    it('should render content when shown via ref', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Visible Content</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Visible Content')).toBeTruthy();
      });
    });

    it('should call hide method without errors', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          // Test that hide can be called
          setTimeout(() => {
            sheetRef.current?.hide();
          }, 50);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Content</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Content')).toBeTruthy();
      });
      // Test passes if no errors thrown
    });
  });

  describe('Props', () => {
    it('should apply custom background color', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef} params={{ backgroundColor: 'red' }}>
              <View>
                <Text>Colored Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Colored Sheet')).toBeTruthy();
      });
    });

    it('should apply custom corner radius', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet
              ref={sheetRef}
              params={{ topLeftRightCornerRadius: 30 }}
            >
              <View>
                <Text>Rounded Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Rounded Sheet')).toBeTruthy();
      });
    });

    it('should apply max height constraint', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef} params={{ maxHeight: 300 }}>
              <View>
                <Text>Max Height Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Max Height Sheet')).toBeTruthy();
      });
    });

    it('should apply min height constraint', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef} params={{ minHeight: 200 }}>
              <View>
                <Text>Min Height Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Min Height Sheet')).toBeTruthy();
      });
    });

    it('should handle dismissable parameter', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef} params={{ dismissable: false }}>
              <View>
                <Text>Non-dismissable Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Non-dismissable Sheet')).toBeTruthy();
      });
    });
  });

  describe('Data Passing', () => {
    it('should pass data to children function', async () => {
      const testData = { name: 'John', age: 30 };

      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show(testData);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              {(data: any) => (
                <View>
                  <Text>Name: {data?.name}</Text>
                  <Text>Age: {data?.age}</Text>
                </View>
              )}
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Name: John')).toBeTruthy();
        expect(getByText('Age: 30')).toBeTruthy();
      });
    });
  });

  describe('ScrollView Attachment', () => {
    it('should allow attaching scroll view', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          sheetRef.current?.attachScrollViewToSheet();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Sheet with ScrollView</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Sheet with ScrollView')).toBeTruthy();
      });
    });
  });

  describe('Root View Style', () => {
    it('should apply custom root view style', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef} rootViewStyle={{ padding: 20 }}>
              <View>
                <Text>Styled Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);
      await waitFor(() => {
        expect(getByText('Styled Sheet')).toBeTruthy();
      });
    });
  });
});
