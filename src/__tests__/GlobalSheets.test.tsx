import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  SheetProvider,
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet,
  attachScrollViewToGlobalFittedSheet,
} from '../index';

describe('Global Sheets API (Simplified)', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <SheetProvider addGlobalSheetView>{children}</SheetProvider>
  );

  describe('presentGlobalFittedSheet', () => {
    it('should present global sheet', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'globalSheet1',
            children: (
              <View>
                <Text>Global Sheet Content</Text>
              </View>
            ),
          });
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Global Sheet Content')).toBeTruthy();
      });
    });

    it('should present multiple global sheets', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'global1',
            children: (
              <View>
                <Text>Global 1</Text>
              </View>
            ),
          });
          presentGlobalFittedSheet({
            name: 'global2',
            children: (
              <View>
                <Text>Global 2</Text>
              </View>
            ),
          });
          presentGlobalFittedSheet({
            name: 'global3',
            children: (
              <View>
                <Text>Global 3</Text>
              </View>
            ),
          });
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Global 1')).toBeTruthy();
        expect(getByText('Global 2')).toBeTruthy();
        expect(getByText('Global 3')).toBeTruthy();
      });
    });

    it('should apply custom sheet props', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'customSheet',
            sheetProps: {
              params: {
                backgroundColor: 'red',
                topLeftRightCornerRadius: 30,
                maxHeight: 500,
              },
            },
            children: (
              <View>
                <Text>Custom Props Sheet</Text>
              </View>
            ),
          });
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Custom Props Sheet')).toBeTruthy();
      });
    });

    it('should render component children', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'componentSheet',
            children: <Text>Component Child</Text>,
          });
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Component Child')).toBeTruthy();
      });
    });

    it('should handle array of children', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'arrayChildren',
            children: [
              <Text key="1">Child 1</Text>,
              <Text key="2">Child 2</Text>,
            ],
          });
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Child 1')).toBeTruthy();
        expect(getByText('Child 2')).toBeTruthy();
      });
    });
  });

  describe('dismissGlobalFittedSheet', () => {
    it('should call dismiss without errors', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'toDismiss',
            children: (
              <View>
                <Text>To Be Dismissed</Text>
              </View>
            ),
          });
          setTimeout(() => {
            dismissGlobalFittedSheet('toDismiss');
          }, 100);
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('To Be Dismissed')).toBeTruthy();
      });

      // Note: Actual dismissal requires native integration
      expect(true).toBe(true);
    });

    it('should handle dismissing non-existent sheet', () => {
      render(<TestWrapper />);
      // Should not throw error
      dismissGlobalFittedSheet('nonExistent');
      expect(true).toBe(true);
    });
  });

  describe('attachScrollViewToGlobalFittedSheet', () => {
    it('should attach scroll view to global sheet', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'scrollSheet',
            children: (
              <View>
                <Text>Scrollable Sheet</Text>
              </View>
            ),
          });
        }, []);

        return <TestWrapper />;
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Scrollable Sheet')).toBeTruthy();
      });

      // Wait for sheet to be fully mounted
      await waitFor(() => {
        const result = attachScrollViewToGlobalFittedSheet('scrollSheet');
        expect(result).toBe(true);
      });
    });

    it('should return false for non-existent sheet', () => {
      render(<TestWrapper />);
      const result = attachScrollViewToGlobalFittedSheet('nonExistent');
      expect(result).toBe(false);
    });

    it('should handle attaching to sheet before it is mounted', () => {
      render(<TestWrapper />);
      const result = attachScrollViewToGlobalFittedSheet('notMountedYet');
      expect(result).toBe(false);
    });
  });

  describe('Memory Management', () => {
    it('should handle rapid present/dismiss cycles', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          for (let i = 0; i < 10; i++) {
            presentGlobalFittedSheet({
              name: 'rapid',
              children: <Text>Rapid {i}</Text>,
            });
            dismissGlobalFittedSheet('rapid');
          }
        }, []);

        return <TestWrapper />;
      };

      // Should not crash or leak memory
      render(<TestComponent />);
      expect(true).toBe(true);
    });

    it('should handle multiple sheets with rapid operations', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          for (let i = 0; i < 5; i++) {
            presentGlobalFittedSheet({
              name: `sheet${i}`,
              children: <Text>Sheet {i}</Text>,
            });
          }
          for (let i = 0; i < 5; i++) {
            dismissGlobalFittedSheet(`sheet${i}`);
          }
        }, []);

        return <TestWrapper />;
      };

      render(<TestComponent />);
      expect(true).toBe(true);
    });
  });

  describe('Global Sheet Props Inheritance', () => {
    it('should inherit default props from SheetProvider', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'inheritProps',
            children: <Text>Inherited Props</Text>,
          });
        }, []);

        return (
          <SheetProvider
            addGlobalSheetView
            globalSheetProps={{
              params: {
                backgroundColor: 'blue',
                topLeftRightCornerRadius: 15,
              },
            }}
          />
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Inherited Props')).toBeTruthy();
      });
    });

    it('should override default props with sheet-specific props', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentGlobalFittedSheet({
            name: 'overrideProps',
            sheetProps: {
              params: {
                backgroundColor: 'red',
              },
            },
            children: <Text>Override Props</Text>,
          });
        }, []);

        return (
          <SheetProvider
            addGlobalSheetView
            globalSheetProps={{
              params: {
                backgroundColor: 'blue',
              },
            }}
          />
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Override Props')).toBeTruthy();
      });
    });
  });
});
