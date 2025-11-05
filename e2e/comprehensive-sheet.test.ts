import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Comprehensive Bottom Sheet E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to E2E Test screen
    await waitFor(element(by.text('Modal/E2ETest')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('Modal/E2ETest')).tap();
    await waitFor(element(by.text('E2E Test Screen')))
      .toBeVisible()
      .withTimeout(2000);
  });

  describe('Data Passing', () => {
    it('should pass data to sheet and retrieve it', async () => {
      // Open sheet with data
      await element(by.id('open-data-sheet-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('basic-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify data was passed
      await detoxExpect(element(by.text('Data Passed'))).toBeVisible();
      await detoxExpect(
        element(by.text('This data was passed to the sheet'))
      ).toBeVisible();

      // Save data and close
      await element(by.id('save-data-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('basic-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);

      // Verify data was saved
      await waitFor(element(by.id('received-data-text')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Non-Dismissable Sheets', () => {
    it('should not close when swiping down on non-dismissable sheet', async () => {
      // Scroll down to find the button
      await element(by.type('RCTScrollView')).atIndex(0).scroll(300, 'down');

      // Wait and tap
      await waitFor(element(by.id('open-non-dismissable-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('open-non-dismissable-sheet-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('non-dismissable-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Try to swipe down (should not close)
      await element(by.id('non-dismissable-sheet-content')).swipe(
        'down',
        'fast',
        0.5
      );

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sheet should still be visible
      await detoxExpect(
        element(by.id('non-dismissable-sheet-content'))
      ).toBeVisible();

      // Close using button
      await element(by.id('close-non-dismissable-sheet-button')).tap();

      // Sheet should now be closed
      await waitFor(element(by.id('non-dismissable-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Global Sheets API', () => {
    it('should open and close global sheet', async () => {
      // Scroll to Global Sheet section
      await element(by.type('RCTScrollView')).atIndex(0).scroll(300, 'down');

      await waitFor(element(by.id('open-global-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open global sheet
      await element(by.id('open-global-sheet-button')).tap();

      // Wait for global sheet to appear
      await waitFor(element(by.id('global-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify content
      await detoxExpect(element(by.text('Global Sheet'))).toBeVisible();
      await detoxExpect(
        element(by.text('This sheet was opened using the global API'))
      ).toBeVisible();

      // Close global sheet
      await element(by.id('close-global-sheet-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('global-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Named Sheets API', () => {
    it('should open and close named sheet with data', async () => {
      // Scroll to Named Sheet section
      await element(by.type('RCTScrollView')).atIndex(0).scroll(300, 'down');

      await waitFor(element(by.id('open-named-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open named sheet
      await element(by.id('open-named-sheet-button')).tap();

      // Wait for named sheet to appear
      await waitFor(element(by.id('named-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify content
      await detoxExpect(
        element(by.text('Named Sheet: testSheet'))
      ).toBeVisible();
      await detoxExpect(element(by.id('named-sheet-message'))).toBeVisible();
      await detoxExpect(element(by.id('named-sheet-timestamp'))).toBeVisible();

      // Close named sheet
      await element(by.id('close-named-sheet-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('named-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Custom Styling', () => {
    it('should render sheet with custom background and corner radius', async () => {
      // Scroll to Styled Sheet section
      await element(by.type('RCTScrollView')).atIndex(0).scroll(400, 'down');

      await waitFor(element(by.id('open-styled-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open styled sheet
      await element(by.id('open-styled-sheet-button')).tap();

      // Wait for styled sheet to appear
      await waitFor(element(by.id('styled-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify content
      await detoxExpect(element(by.text('Styled Sheet'))).toBeVisible();
      await detoxExpect(
        element(by.text('This sheet has custom styling:'))
      ).toBeVisible();
      await detoxExpect(
        element(by.text('• Red background (#FF6B6B)'))
      ).toBeVisible();
      await detoxExpect(element(by.text('• 30px corner radius'))).toBeVisible();

      // Close styled sheet
      await element(by.id('close-styled-sheet-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('styled-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Height Constraints', () => {
    it('should respect min height constraint', async () => {
      // Scroll to Min Height section
      await element(by.type('RCTScrollView')).atIndex(0).scroll(500, 'down');

      await waitFor(element(by.id('open-min-height-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open min height sheet
      await element(by.id('open-min-height-sheet-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('min-height-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify content
      await detoxExpect(element(by.text('Min Height Sheet'))).toBeVisible();
      await detoxExpect(
        element(by.text('This sheet has a minimum height of 400px'))
      ).toBeVisible();

      // Close sheet
      await element(by.id('close-min-height-sheet-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('min-height-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should respect max height constraint', async () => {
      // Scroll to Max Height section
      await element(by.type('RCTScrollView')).atIndex(0).scroll(600, 'down');

      await waitFor(element(by.id('open-max-height-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open max height sheet
      await element(by.id('open-max-height-sheet-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('max-height-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify content
      await detoxExpect(element(by.text('Max Height Sheet'))).toBeVisible();
      await detoxExpect(
        element(by.text('This sheet has a maximum height of 300px'))
      ).toBeVisible();

      // Close sheet
      await element(by.id('close-max-height-sheet-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('max-height-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Backdrop Dismiss', () => {
    it('should close sheet when swiping down', async () => {
      // Open basic sheet
      await element(by.id('open-basic-sheet-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('basic-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Swipe down to close (testing dismiss functionality)
      await element(by.id('basic-sheet-content')).swipe('down', 'fast', 0.8);

      // Wait for sheet to close
      await waitFor(element(by.id('basic-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Multiple Operations', () => {
    it('should handle multiple open/close cycles', async () => {
      for (let i = 0; i < 3; i++) {
        // Open sheet
        await element(by.id('open-basic-sheet-button')).tap();

        // Wait for sheet to appear
        await waitFor(element(by.id('basic-sheet-content')))
          .toBeVisible()
          .withTimeout(2000);

        // Close sheet
        await element(by.id('close-basic-sheet-button')).tap();

        // Wait for sheet to close
        await waitFor(element(by.id('basic-sheet-content')))
          .not.toBeVisible()
          .withTimeout(2000);
      }
    });

    it('should handle rapid operations with different sheet types', async () => {
      // Open basic sheet
      await element(by.id('open-basic-sheet-button')).tap();
      await waitFor(element(by.id('basic-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Close it
      await element(by.id('close-basic-sheet-button')).tap();
      await waitFor(element(by.id('basic-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);

      // Scroll to global sheet button
      await element(by.type('RCTScrollView')).atIndex(0).scroll(300, 'down');

      await waitFor(element(by.id('open-global-sheet-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open global sheet
      await element(by.id('open-global-sheet-button')).tap();

      // Verify global sheet opened
      await waitFor(element(by.id('global-sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Close global sheet
      await element(by.id('close-global-sheet-button')).tap();
      await waitFor(element(by.id('global-sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });
});