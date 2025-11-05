import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('ScrollView Wrapping E2E Tests', () => {
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
    // Wait for the main scroll view to be ready
    await waitFor(element(by.id('e2e-main-scroll')))
      .toBeVisible()
      .withTimeout(2000);
  });

  describe('ScrollView Wrapped in View (Problematic)', () => {
    it('should open sheet with ScrollView wrapped in View', async () => {
      // Scroll to the test section
      await element(by.id('e2e-main-scroll')).scroll(700, 'down');

      // Wait for button to be visible
      await waitFor(element(by.id('open-scrollview-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open the sheet
      await element(by.id('open-scrollview-wrapped-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('scrollview-wrapped-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify title
      await detoxExpect(element(by.text('ScrollView in View'))).toBeVisible();

      // Verify warning message
      await detoxExpect(
        element(
          by.text(
            '⚠️ Bottom items may not be visible due to height calculation issues'
          )
        )
      ).toBeVisible();

      // Verify ScrollView is present
      await detoxExpect(
        element(by.id('scrollview-wrapped-scroll'))
      ).toBeVisible();

      // Verify first item is visible
      await detoxExpect(element(by.text('Wrapped Item 1'))).toBeVisible();

      // Try to scroll to bottom
      await element(by.id('scrollview-wrapped-scroll')).scrollTo('bottom');

      // Wait a bit for scroll to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Close the sheet
      await element(by.id('close-scrollview-wrapped-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('scrollview-wrapped-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should verify scrolling behavior in View-wrapped ScrollView', async () => {
      // Scroll to the test section
      await element(by.id('e2e-main-scroll')).scroll(700, 'down');

      await waitFor(element(by.id('open-scrollview-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open the sheet
      await element(by.id('open-scrollview-wrapped-button')).tap();

      await waitFor(element(by.id('scrollview-wrapped-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify we can see early items
      await detoxExpect(element(by.text('Wrapped Item 1'))).toBeVisible();

      // Try to scroll within the sheet's ScrollView
      await element(by.id('scrollview-wrapped-scroll')).scroll(300, 'down');

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try to find middle items
      await waitFor(element(by.text('Wrapped Item 25')))
        .toBeVisible()
        .withTimeout(2000);

      // Close sheet
      await element(by.id('close-scrollview-wrapped-button')).tap();
      await waitFor(element(by.id('scrollview-wrapped-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('ScrollView Wrapped in Fragment (Correct)', () => {
    it('should open sheet with ScrollView wrapped in Fragment', async () => {
      // Scroll to the test section
      await element(by.id('e2e-main-scroll')).scroll(800, 'down');

      // Wait for button to be visible
      await waitFor(element(by.id('open-scrollfragment-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open the sheet
      await element(by.id('open-scrollfragment-wrapped-button')).tap();

      // Wait for sheet to appear
      await waitFor(element(by.id('scrollfragment-wrapped-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify title
      await detoxExpect(
        element(by.text('ScrollView in Fragment'))
      ).toBeVisible();

      // Verify success message
      await detoxExpect(
        element(by.text('✅ All bottom items should be accessible'))
      ).toBeVisible();

      // Verify ScrollView is present
      await detoxExpect(
        element(by.id('scrollfragment-wrapped-scroll'))
      ).toBeVisible();

      // Verify first item is visible
      await detoxExpect(element(by.text('Fragment Item 1'))).toBeVisible();

      // Close the sheet
      await element(by.id('close-scrollfragment-wrapped-button')).tap();

      // Wait for sheet to close
      await waitFor(element(by.id('scrollfragment-wrapped-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should properly scroll to bottom items in Fragment-wrapped ScrollView', async () => {
      // Scroll to the test section
      await element(by.id('e2e-main-scroll')).scroll(800, 'down');

      await waitFor(element(by.id('open-scrollfragment-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open the sheet
      await element(by.id('open-scrollfragment-wrapped-button')).tap();

      await waitFor(element(by.id('scrollfragment-wrapped-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify first item
      await detoxExpect(element(by.text('Fragment Item 1'))).toBeVisible();

      // Scroll to middle
      await element(by.id('scrollfragment-wrapped-scroll')).scroll(
        300,
        'down'
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify middle items are accessible
      await waitFor(element(by.text('Fragment Item 25')))
        .toBeVisible()
        .withTimeout(2000);

      // Scroll to bottom
      await element(by.id('scrollfragment-wrapped-scroll')).scrollTo(
        'bottom'
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify bottom items are accessible (this is the key test)
      await waitFor(element(by.text('Fragment Item 50')))
        .toBeVisible()
        .withTimeout(2000);

      // Close sheet
      await element(by.id('close-scrollfragment-wrapped-button')).tap();
      await waitFor(element(by.id('scrollfragment-wrapped-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should handle multiple open/close cycles with Fragment-wrapped ScrollView', async () => {
      // Scroll to the test section
      await element(by.id('e2e-main-scroll')).scroll(800, 'down');

      await waitFor(element(by.id('open-scrollfragment-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      // Open and close 3 times
      for (let i = 0; i < 3; i++) {
        // Open
        await element(by.id('open-scrollfragment-wrapped-button')).tap();
        await waitFor(element(by.id('scrollfragment-wrapped-content')))
          .toBeVisible()
          .withTimeout(2000);

        // Verify content
        await detoxExpect(element(by.text('Fragment Item 1'))).toBeVisible();

        // Close
        await element(by.id('close-scrollfragment-wrapped-button')).tap();
        await waitFor(element(by.id('scrollfragment-wrapped-content')))
          .not.toBeVisible()
          .withTimeout(2000);
      }
    });
  });

  describe('Comparison between View and Fragment wrapping', () => {
    it('should demonstrate that Fragment wrapping allows access to all items', async () => {
      // First test View-wrapped (problematic)
      await element(by.id('e2e-main-scroll')).scroll(700, 'down');
      await waitFor(element(by.id('open-scrollview-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.id('open-scrollview-wrapped-button')).tap();
      await waitFor(element(by.id('scrollview-wrapped-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Try to scroll to bottom in View-wrapped
      await element(by.id('scrollview-wrapped-scroll')).scrollTo('bottom');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Close View-wrapped sheet
      await element(by.id('close-scrollview-wrapped-button')).tap();
      await waitFor(element(by.id('scrollview-wrapped-content')))
        .not.toBeVisible()
        .withTimeout(2000);

      // Now test Fragment-wrapped (correct)
      await element(by.id('e2e-main-scroll')).scroll(100, 'down');
      await waitFor(element(by.id('open-scrollfragment-wrapped-button')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.id('open-scrollfragment-wrapped-button')).tap();
      await waitFor(element(by.id('scrollfragment-wrapped-content')))
        .toBeVisible()
        .withTimeout(2000);

      // Scroll to bottom in Fragment-wrapped
      await element(by.id('scrollfragment-wrapped-scroll')).scrollTo(
        'bottom'
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // This should succeed with Fragment wrapping
      await waitFor(element(by.text('Fragment Item 50')))
        .toBeVisible()
        .withTimeout(2000);

      // Close Fragment-wrapped sheet
      await element(by.id('close-scrollfragment-wrapped-button')).tap();
      await waitFor(element(by.id('scrollfragment-wrapped-content')))
        .not.toBeVisible()
        .withTimeout(2000);
    });
  });
});