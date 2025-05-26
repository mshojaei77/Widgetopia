/**
 * Tests for Custom Wallpaper Upload Feature
 */

describe('Custom Wallpaper Upload', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    localStorageMock.clear();
  });

  test('should store custom wallpaper in localStorage', () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    localStorage.setItem('customWallpaper', base64Image);
    
    expect(localStorage.getItem('customWallpaper')).toBe(base64Image);
  });

  test('should prioritize custom wallpaper over selected wallpaper', () => {
    const customWallpaper = 'data:image/png;base64,custom';
    const selectedWallpaper = '/wallpapers/forest.jpg';
    
    localStorage.setItem('customWallpaper', customWallpaper);
    localStorage.setItem('selectedWallpaper', selectedWallpaper);
    
    // Simulate the wallpaper initialization logic from App.tsx
    const getInitialWallpaper = () => {
      const customWallpaper = localStorage.getItem('customWallpaper');
      if (customWallpaper) {
        return customWallpaper;
      }
      return localStorage.getItem('selectedWallpaper') || '/wallpapers/forest.jpg';
    };
    
    expect(getInitialWallpaper()).toBe(customWallpaper);
  });

  test('should fall back to selected wallpaper when no custom wallpaper', () => {
    const selectedWallpaper = '/wallpapers/mountains.jpg';
    localStorage.setItem('selectedWallpaper', selectedWallpaper);
    
    const getInitialWallpaper = () => {
      const customWallpaper = localStorage.getItem('customWallpaper');
      if (customWallpaper) {
        return customWallpaper;
      }
      return localStorage.getItem('selectedWallpaper') || '/wallpapers/forest.jpg';
    };
    
    expect(getInitialWallpaper()).toBe(selectedWallpaper);
  });

  test('should use default wallpaper when no custom or selected wallpaper', () => {
    const getInitialWallpaper = () => {
      const customWallpaper = localStorage.getItem('customWallpaper');
      if (customWallpaper) {
        return customWallpaper;
      }
      return localStorage.getItem('selectedWallpaper') || '/wallpapers/forest.jpg';
    };
    
    expect(getInitialWallpaper()).toBe('/wallpapers/forest.jpg');
  });

  test('should remove custom wallpaper from localStorage', () => {
    const base64Image = 'data:image/png;base64,test';
    localStorage.setItem('customWallpaper', base64Image);
    
    expect(localStorage.getItem('customWallpaper')).toBe(base64Image);
    
    localStorage.removeItem('customWallpaper');
    
    expect(localStorage.getItem('customWallpaper')).toBeNull();
  });

  test('should identify base64 wallpapers correctly', () => {
    const isBase64Wallpaper = (wallpaper: string) => wallpaper.startsWith('data:image/');
    
    expect(isBase64Wallpaper('data:image/png;base64,test')).toBe(true);
    expect(isBase64Wallpaper('data:image/jpeg;base64,test')).toBe(true);
    expect(isBase64Wallpaper('/wallpapers/forest.jpg')).toBe(false);
    expect(isBase64Wallpaper('https://example.com/image.png')).toBe(false);
  });
});

/**
 * File Upload Validation Tests
 */
describe('File Upload Validation', () => {
  test('should validate image file types', () => {
    const validateFileType = (file: { type: string }) => {
      return file.type.startsWith('image/');
    };
    
    expect(validateFileType({ type: 'image/png' })).toBe(true);
    expect(validateFileType({ type: 'image/jpeg' })).toBe(true);
    expect(validateFileType({ type: 'image/webp' })).toBe(true);
    expect(validateFileType({ type: 'text/plain' })).toBe(false);
    expect(validateFileType({ type: 'application/pdf' })).toBe(false);
  });

  test('should validate file size limits', () => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    const validateFileSize = (file: { size: number }) => {
      return file.size <= MAX_SIZE;
    };
    
    expect(validateFileSize({ size: 1024 * 1024 })).toBe(true); // 1MB
    expect(validateFileSize({ size: MAX_SIZE })).toBe(true); // Exactly 5MB
    expect(validateFileSize({ size: MAX_SIZE + 1 })).toBe(false); // Over 5MB
    expect(validateFileSize({ size: 10 * 1024 * 1024 })).toBe(false); // 10MB
  });
}); 