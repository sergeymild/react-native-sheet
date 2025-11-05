import { viewportSize } from '../index';
import SheetModule from '../NativeSheet';

describe('Utility Functions', () => {
  describe('viewportSize', () => {
    it('should return viewport dimensions', () => {
      const result = viewportSize();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(typeof result.width).toBe('number');
      expect(typeof result.height).toBe('number');
    });

    it('should call SheetModule.viewportSize', () => {
      const spy = jest.spyOn(SheetModule, 'viewportSize');
      viewportSize();
      expect(spy).toHaveBeenCalled();
    });

    it('should return positive dimensions', () => {
      const result = viewportSize();
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });
});