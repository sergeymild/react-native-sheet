import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Max Height Sheet with Padding E2E Test', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Navigate to E2E Test screen once
    await waitFor(element(by.text('Modal/E2ETest')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('Modal/E2ETest')).tap();
    await waitFor(element(by.text('E2E Test Screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should verify that item 40 is not visible due to 40px padding in max height sheet', async () => {
    // Scroll to Max Height Sheet section in smaller increments
    await element(by.id('e2e-main-scroll')).scroll(300, 'down');
    await new Promise((resolve) => setTimeout(resolve, 300));
    await element(by.id('e2e-main-scroll')).scroll(200, 'down');

    // Wait a bit for scroll to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Wait for button to be visible
    await waitFor(element(by.id('open-max-height-sheet-button')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify button is visible before tapping
    await detoxExpect(element(by.id('open-max-height-sheet-button'))).toBeVisible();

    // Open the max height sheet
    await element(by.id('open-max-height-sheet-button')).tap();

    // Wait longer for sheet to appear
    await waitFor(element(by.id('max-height-sheet-content')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify title
    await detoxExpect(element(by.text('Max Height Sheet'))).toBeVisible();

    // Verify description mentions 40px padding
    await detoxExpect(
      element(by.text('This sheet has a maximum height of 300px with 40px padding'))
    ).toBeVisible();

    // Verify ScrollView is present
    await detoxExpect(element(by.id('max-height-scroll-view'))).toBeVisible();

    // Verify first few items are visible
    await detoxExpect(
      element(by.text('Long content item 1'))
    ).toBeVisible();

    // Try to scroll to the very bottom of the ScrollView
    await element(by.id('max-height-scroll-view')).scrollTo('bottom');

    // Wait for scroll animation to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Now try to find item 40 - it should NOT be visible
    // because the large padding (40px) and maxHeight (300px) constraint
    // means the ScrollView doesn't have enough space to show all items
    try {
      await waitFor(element(by.id('max-height-item-40')))
        .toBeVisible()
        .withTimeout(1000);

      // If we reach here, the test should fail because item 40 should NOT be visible
      throw new Error('Item 40 should NOT be visible due to padding constraints');
    } catch (error: any) {
      // Expected behavior: item 40 is not visible
      if (error.message && error.message.includes('Timed out')) {
        // This is what we expect - item 40 is not visible
        console.log('✅ Correct: Item 40 is not visible as expected');
      } else if (error.message && error.message.includes('should NOT be visible')) {
        // We threw this error ourselves - test failed
        throw error;
      } else {
        // Some other error occurred
        throw error;
      }
    }

    // Verify that we can see items in the middle range
    // Let's check if we can see item 20 or 25
    await element(by.id('max-height-scroll-view')).scroll(200, 'up');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Item 20 should be accessible
    await waitFor(element(by.text('Long content item 20')))
      .toBeVisible()
      .withTimeout(2000);

    // Scroll down again to verify the last visible items
    await element(by.id('max-height-scroll-view')).scrollTo('bottom');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to find items near the end (35-39) which might be partially visible
    // We expect that items beyond a certain point won't be fully accessible
    let lastVisibleItem = 0;

    for (let i = 35; i <= 40; i++) {
      try {
        await waitFor(element(by.id(`max-height-item-${i}`)))
          .toBeVisible()
          .withTimeout(500);
        lastVisibleItem = i;
      } catch (e) {
        // Item is not visible
        break;
      }
    }

    console.log(`Last visible item: ${lastVisibleItem}`);

    // Assert that item 40 is definitely not reachable
    if (lastVisibleItem >= 40) {
      throw new Error(`Item 40 should not be visible, but last visible item was ${lastVisibleItem}`);
    }

    // Close the sheet
    await element(by.id('close-max-height-sheet-button')).tap();

    // Wait for sheet to close
    await waitFor(element(by.id('max-height-sheet-content')))
      .not.toBeVisible()
      .withTimeout(2000);
  });

  it('should demonstrate the padding issue more explicitly', async () => {
    // Scroll to Max Height Sheet section
    await element(by.id('e2e-main-scroll')).scroll(500, 'down');

    await waitFor(element(by.id('open-max-height-sheet-button')))
      .toBeVisible()
      .withTimeout(2000);

    // Open the max height sheet
    await element(by.id('open-max-height-sheet-button')).tap();

    await waitFor(element(by.id('max-height-sheet-content')))
      .toBeVisible()
      .withTimeout(2000);

    // First, verify that early items are visible
    await detoxExpect(element(by.text('Long content item 1'))).toBeVisible();
    await detoxExpect(element(by.text('Long content item 2'))).toBeVisible();

    // Scroll to middle
    await element(by.id('max-height-scroll-view')).scroll(300, 'down');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Middle items should be visible
    await waitFor(element(by.text('Long content item 15')))
      .toBeVisible()
      .withTimeout(2000);

    // Try to scroll to the absolute bottom
    await element(by.id('max-height-scroll-view')).scrollTo('bottom');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Attempt to find item 40 by scrolling multiple times
    let found = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await element(by.id('max-height-scroll-view')).scroll(50, 'down');
        await new Promise((resolve) => setTimeout(resolve, 300));

        await waitFor(element(by.id('max-height-item-40')))
          .toBeVisible()
          .withTimeout(500);

        found = true;
        break;
      } catch (e) {
        // Not found yet, continue
      }
    }

    // Assert that item 40 was never found
    if (found) {
      throw new Error(
        'FAIL: Item 40 is visible, but it should NOT be due to 40px padding constraint. ' +
        'The padding reduces available space for the ScrollView content.'
      );
    }

    console.log(
      '✅ SUCCESS: Item 40 is correctly NOT visible. ' +
      'The 40px padding in a 300px max height sheet leaves insufficient space for all 40 items.'
    );

    // Close the sheet
    await element(by.id('close-max-height-sheet-button')).tap();
    await waitFor(element(by.id('max-height-sheet-content')))
      .not.toBeVisible()
      .withTimeout(2000);
  });
});