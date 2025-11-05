import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Bottom Sheet E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Navigate to E2E Test screen
    await waitFor(element(by.text('Modal/E2ETest')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('Modal/E2ETest')).tap();
  });

  it('should open and close sheet with button', async () => {
    // Verify the open button is visible
    await detoxExpect(element(by.id('open-sheet-button'))).toBeVisible();

    // Open the sheet
    await element(by.id('open-sheet-button')).tap();

    // Verify sheet content is visible
    await waitFor(element(by.id('sheet-content')))
      .toBeVisible()
      .withTimeout(2000);

    await detoxExpect(element(by.id('sheet-title'))).toBeVisible();
    await detoxExpect(element(by.text('Bottom Sheet'))).toBeVisible();

    // Close the sheet using close button
    await element(by.id('close-sheet-button')).tap();

    // Verify sheet is hidden
    await waitFor(element(by.id('sheet-content')))
      .not.toBeVisible()
      .withTimeout(2000);
  });

  it('should close sheet by swiping down', async () => {
    // Open the sheet
    await element(by.id('open-sheet-button')).tap();

    // Wait for sheet to be visible
    await waitFor(element(by.id('sheet-content')))
      .toBeVisible()
      .withTimeout(2000);

    // Swipe down to close
    await element(by.id('sheet-content')).swipe('down', 'fast', 0.8);

    // Verify sheet is hidden
    await waitFor(element(by.id('sheet-content')))
      .not.toBeVisible()
      .withTimeout(2000);
  });

  it('should allow scrolling in sheet content', async () => {
    // Open the sheet
    await element(by.id('open-sheet-button')).tap();

    // Wait for sheet to be visible
    await waitFor(element(by.id('sheet-content')))
      .toBeVisible()
      .withTimeout(2000);

    // Check if scroll view is present
    await detoxExpect(element(by.id('sheet-scroll-view'))).toBeVisible();

    // Scroll in the sheet
    await element(by.id('sheet-scroll-view')).scrollTo('bottom');

    // Verify last item is visible
    await detoxExpect(element(by.text('Item 20'))).toBeVisible();

    // Close the sheet
    await element(by.id('close-sheet-button')).tap();
  });

  it('should open multiple times', async () => {
    // Open and close the sheet 3 times
    for (let i = 0; i < 3; i++) {
      // Open
      await element(by.id('open-sheet-button')).tap();
      await waitFor(element(by.id('sheet-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Close
      await element(by.id('close-sheet-button')).tap();
      await waitFor(element(by.id('sheet-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    }

    // Final verification - button should still work
    await detoxExpect(element(by.id('open-sheet-button'))).toBeVisible();
  });
});