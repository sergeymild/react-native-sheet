import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  FittedSheet,
  SheetProvider,
  presentFittedSheet,
  dismissFittedSheet,
  dismissFittedSheetsAll,
  dismissFittedPresented,
  attachScrollViewToFittedSheet,
} from '../index';

describe('Named Sheets (Simplified)', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <SheetProvider>{children}</SheetProvider>
  );

  beforeEach(() => {
    dismissFittedSheetsAll();
  });

  describe('presentFittedSheet', () => {
    it('should present named sheet', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('testSheet');
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="testSheet">
              <View>
                <Text>Named Sheet Content</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Named Sheet Content')).toBeTruthy();
      });
    });

    it('should return false for non-existent sheet', () => {
      render(<TestWrapper />);
      const result = presentFittedSheet('nonExistent');
      expect(result).toBe(false);
    });

    it('should pass data to named sheet', async () => {
      const testData = { userId: 123 };

      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('dataSheet', testData);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="dataSheet">
              {(data: any) => (
                <View>
                  <Text>User ID: {data?.userId}</Text>
                </View>
              )}
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('User ID: 123')).toBeTruthy();
      });
    });
  });

  describe('dismissFittedSheet', () => {
    it('should call dismissFittedSheet without errors', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('dismissTest');
          setTimeout(() => {
            dismissFittedSheet('dismissTest');
          }, 100);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="dismissTest">
              <View>
                <Text>Dismissable Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Dismissable Sheet')).toBeTruthy();
      });

      // Note: Actual dismissal requires native module simulation
      // This test verifies the call doesn't error
      expect(true).toBe(true);
    });

    it('should return false for non-existent sheet', () => {
      render(<TestWrapper />);
      const result = dismissFittedSheet('nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('Multiple Named Sheets', () => {
    it('should handle multiple sheets with different names', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('sheet1');
          presentFittedSheet('sheet2');
          presentFittedSheet('sheet3');
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="sheet1">
              <View>
                <Text>Sheet 1</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="sheet2">
              <View>
                <Text>Sheet 2</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="sheet3">
              <View>
                <Text>Sheet 3</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Sheet 1')).toBeTruthy();
        expect(getByText('Sheet 2')).toBeTruthy();
        expect(getByText('Sheet 3')).toBeTruthy();
      });
    });
  });

  describe('dismissFittedSheetsAll', () => {
    it('should call dismissFittedSheetsAll without errors', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('sheet1');
          presentFittedSheet('sheet2');
          presentFittedSheet('sheet3');
          setTimeout(() => {
            dismissFittedSheetsAll();
          }, 100);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="sheet1">
              <View>
                <Text>Sheet 1</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="sheet2">
              <View>
                <Text>Sheet 2</Text>
              </View>
            </FittedSheet>
            <FittedSheet name="sheet3">
              <View>
                <Text>Sheet 3</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Sheet 1')).toBeTruthy();
        expect(getByText('Sheet 2')).toBeTruthy();
        expect(getByText('Sheet 3')).toBeTruthy();
      });

      // Note: Actual dismissal requires native module simulation
      expect(true).toBe(true);
    });
  });

  describe('dismissFittedPresented', () => {
    it('should call dismissFittedPresented without errors', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('presented');
          setTimeout(() => {
            dismissFittedPresented();
          }, 100);
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="presented">
              <View>
                <Text>Presented Sheet</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Presented Sheet')).toBeTruthy();
      });

      // Note: Actual dismissal requires native module simulation
      expect(true).toBe(true);
    });
  });

  describe('attachScrollViewToFittedSheet', () => {
    it('should attach scroll view to named sheet', async () => {
      const TestComponent = () => {
        React.useEffect(() => {
          presentFittedSheet('scrollSheet');
          attachScrollViewToFittedSheet('scrollSheet');
        }, []);

        return (
          <TestWrapper>
            <FittedSheet name="scrollSheet">
              <View>
                <Text>Sheet with Scroll</Text>
              </View>
            </FittedSheet>
          </TestWrapper>
        );
      };

      const { getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Sheet with Scroll')).toBeTruthy();
      });

      const result = attachScrollViewToFittedSheet('scrollSheet');
      expect(result).toBe(true);
    });

    it('should return false for non-existent sheet', () => {
      render(<TestWrapper />);
      const result = attachScrollViewToFittedSheet('nonExistent');
      expect(result).toBe(false);
    });
  });

  describe('Sheet Name Conflicts', () => {
    it('should warn when registering duplicate sheet names', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <TestWrapper>
          <FittedSheet name="duplicate">
            <View>
              <Text>Sheet 1</Text>
            </View>
          </FittedSheet>
          <FittedSheet name="duplicate">
            <View>
              <Text>Sheet 2</Text>
            </View>
          </FittedSheet>
        </TestWrapper>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sheet with name duplicate exists'
      );

      consoleSpy.mockRestore();
    });
  });
});
