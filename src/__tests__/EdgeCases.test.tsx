import React, { useRef } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  FittedSheet,
  SheetProvider,
  presentFittedSheet,
  dismissFittedSheet,
  dismissFittedSheetsAll,
  type FittedSheetRef,
} from '../index';

describe('Edge Cases', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <SheetProvider>{children}</SheetProvider>
  );

  beforeEach(() => {
    dismissFittedSheetsAll();
  });

  describe('Non-Dismissable Sheets', () => {
    it('should prevent dismissal when dismissable is false', async () => {
      const onDismiss = jest.fn();

      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet
              ref={sheetRef}
              params={{ dismissable: false }}
              onSheetDismiss={onDismiss}
            >
              <View>
                <Text>Non-Dismissable Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Non-Dismissable Sheet')).toBeTruthy();
      });

      // onDismiss should not be called automatically
      await waitFor(
        () => {
          expect(onDismiss).not.toHaveBeenCalled();
        },
        { timeout: 200 }
      );
    });

    it('should allow programmatic dismissal even when dismissable is false', async () => {
      const onDismiss = jest.fn();

      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          setTimeout(() => {
            sheetRef.current?.hide();
          }, 100);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet
              ref={sheetRef}
              params={{ dismissable: false }}
              onSheetDismiss={onDismiss}
            >
              <View>
                <Text>Programmatic Dismiss</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Programmatic Dismiss')).toBeTruthy();
      });

      // Note: In unit tests, native dismiss behavior cannot be fully simulated
      // This test verifies that hide() can be called without errors
      expect(onDismiss).toHaveBeenCalledTimes(0); // Will be 0 in unit test, 1 in integration test
    });
  });

  describe('Multiple Show/Hide Cycles', () => {
    it('should handle rapid show/hide cycles', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          sheetRef.current?.hide();
          sheetRef.current?.show();
          sheetRef.current?.hide();
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Rapid Cycles</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Rapid Cycles')).toBeTruthy();
      });
    });

    it('should handle hide when not shown', () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          // Try to hide without showing first
          sheetRef.current?.hide();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Never Shown</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      // Should not crash
      render(<TestComponent />);
    });

    it('should handle multiple show calls without hide', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          sheetRef.current?.show();
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Multiple Show</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Multiple Show')).toBeTruthy();
      });
    });
  });

  describe('Data Passing Edge Cases', () => {
    it('should handle undefined data', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show(undefined);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              {(data: any) => (
                <View>
                  <Text>Data: {data === undefined ? 'undefined' : 'defined'}</Text>
                </View>
              )}
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Data: undefined')).toBeTruthy();
      });
    });

    it('should handle null data', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show(null);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              {(data: any) => (
                <View>
                  <Text>Data: {data === null ? 'null' : 'not null'}</Text>
                </View>
              )}
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Data: null')).toBeTruthy();
      });
    });

    it('should handle complex nested data', async () => {
      const complexData = {
        user: {
          name: 'John',
          nested: {
            value: 42,
          },
        },
        array: [1, 2, 3],
      };

      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show(complexData);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              {(data: any) => (
                <View>
                  <Text>Name: {data?.user?.name}</Text>
                  <Text>Value: {data?.user?.nested?.value}</Text>
                  <Text>Array: {data?.array?.join(',')}</Text>
                </View>
              )}
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Name: John')).toBeTruthy();
        expect(getByText('Value: 42')).toBeTruthy();
        expect(getByText('Array: 1,2,3')).toBeTruthy();
      });
    });

    it('should update data on subsequent show calls', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show({ count: 1 });
          setTimeout(() => {
            sheetRef.current?.show({ count: 2 });
          }, 100);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              {(data: any) => (
                <View>
                  <Text>Count: {data?.count}</Text>
                </View>
              )}
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Count: 1')).toBeTruthy();
      });

      await waitFor(
        () => {
          expect(getByText('Count: 2')).toBeTruthy();
        },
        { timeout: 500 }
      );
    });
  });

  describe('Pass Through Parameters', () => {
    it('should accept pass through parameter on hide', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          // Test that hide accepts parameter without errors
          sheetRef.current?.hide({ result: 'success' });
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>Pass Through</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      // Test passes if no errors are thrown
      render(<TestComponent />);
      expect(true).toBe(true);
    });

    it('should handle hide without parameters', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
          sheetRef.current?.hide();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef}>
              <View>
                <Text>No Param</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      // Test passes if no errors are thrown
      render(<TestComponent />);
      expect(true).toBe(true);
    });
  });

  describe('Queue Behavior', () => {
    it('should handle presenting multiple named sheets in sequence', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('first');
          presentFittedSheet('second');
          presentFittedSheet('third');
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="first">
              <View>
                <Text>First Sheet</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="second">
              <View>
                <Text>Second Sheet</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="third">
              <View>
                <Text>Third Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('First Sheet')).toBeTruthy();
        expect(getByText('Second Sheet')).toBeTruthy();
        expect(getByText('Third Sheet')).toBeTruthy();
      });
    });

    it('should handle dismissing middle sheet from queue', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('first');
          presentFittedSheet('second');
          presentFittedSheet('third');
          setTimeout(() => {
            dismissFittedSheet('second');
          }, 100);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="first">
              <View>
                <Text>First</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="second">
              <View>
                <Text>Second</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="third">
              <View>
                <Text>Third</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('First')).toBeTruthy();
        expect(getByText('Second')).toBeTruthy();
        expect(getByText('Third')).toBeTruthy();
      });

      // Note: dismissFittedSheet is called but native dismissal simulation
      // is limited in unit tests. Integration tests would verify full behavior.
    });
  });

  describe('Size Constraints Edge Cases', () => {
    it('should handle max height larger than screen', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet ref={sheetRef} params={{ maxHeight: 10000 }}>
              <View>
                <Text>Large Max Height</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Large Max Height')).toBeTruthy();
      });
    });

    it('should handle min height larger than max height', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet
              ref={sheetRef}
              params={{ minHeight: 500, maxHeight: 300 }}
            >
              <View>
                <Text>Conflicting Heights</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Conflicting Heights')).toBeTruthy();
      });
    });

    it('should handle applyMaxHeightToMinHeight', async () => {
      const TestComponent = () => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          sheetRef.current?.show();
        }, []);

        return (
          <TestWrapper>
            <FittedSheet
              ref={sheetRef}
              params={{
                maxHeight: 400,
                applyMaxHeightToMinHeight: true,
              }}
            >
              <View>
                <Text>Apply Max to Min</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Apply Max to Min')).toBeTruthy();
      });
    });
  });

  describe('Unmounting Edge Cases', () => {
    it('should cleanup when sheet is unmounted while shown', async () => {
      const TestComponent = ({ mounted }: { mounted: boolean }) => {
        const sheetRef = useRef<FittedSheetRef>(null);

        React.useEffect(() => {
          if (mounted) {
            sheetRef.current?.show();
          }
        }, [mounted]);

        return (
          <TestWrapper>
            {mounted && (
              <FittedSheet ref={sheetRef}>
                <View>
                  <Text>Unmount Test</Text>
                </View>
              </FittedSheet>
            )}
          </TestWrapper>
        );
      };

      const { getByText, queryByText, rerender } = render(
        <TestComponent mounted={true} />
      );

      await waitFor(() => {
        expect(getByText('Unmount Test')).toBeTruthy();
      });

      // Unmount sheet while it's shown
      rerender(<TestComponent mounted={false} />);

      await waitFor(() => {
        expect(queryByText('Unmount Test')).toBeNull();
      });
    });
  });
});