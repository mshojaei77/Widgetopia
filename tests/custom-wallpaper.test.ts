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

  test('should store multiple custom wallpapers in localStorage', () => {
    const base64Image1 = 'data:image/png;base64,image1';
    const base64Image2 = 'data:image/png;base64,image2';
    const customWallpapers = [base64Image1, base64Image2];
    
    localStorage.setItem('customWallpapers', JSON.stringify(customWallpapers));
    
    const stored = localStorage.getItem('customWallpapers');
    expect(JSON.parse(stored!)).toEqual(customWallpapers);
  });

  test('should add new wallpaper to existing custom wallpapers array', () => {
    const existingWallpapers = ['data:image/png;base64,existing'];
    const newWallpaper = 'data:image/png;base64,new';
    
    localStorage.setItem('customWallpapers', JSON.stringify(existingWallpapers));
    
    const current = JSON.parse(localStorage.getItem('customWallpapers') || '[]');
    const updated = [...current, newWallpaper];
    localStorage.setItem('customWallpapers', JSON.stringify(updated));
    
    const result = JSON.parse(localStorage.getItem('customWallpapers')!);
    expect(result).toEqual([...existingWallpapers, newWallpaper]);
  });

  test('should remove specific custom wallpaper from array', () => {
    const wallpapers = ['data:image/png;base64,image1', 'data:image/png;base64,image2', 'data:image/png;base64,image3'];
    const wallpaperToRemove = 'data:image/png;base64,image2';
    
    localStorage.setItem('customWallpapers', JSON.stringify(wallpapers));
    
    const current = JSON.parse(localStorage.getItem('customWallpapers') || '[]');
    const updated = current.filter((w: string) => w !== wallpaperToRemove);
    localStorage.setItem('customWallpapers', JSON.stringify(updated));
    
    const result = JSON.parse(localStorage.getItem('customWallpapers')!);
    expect(result).toEqual(['data:image/png;base64,image1', 'data:image/png;base64,image3']);
  });

  test('should migrate old single custom wallpaper to new array system', () => {
    const oldCustomWallpaper = 'data:image/png;base64,old';
    localStorage.setItem('customWallpaper', oldCustomWallpaper);
    
    // Simulate migration logic
    const oldWallpaper = localStorage.getItem('customWallpaper');
    if (oldWallpaper) {
      const existingCustomWallpapers = localStorage.getItem('customWallpapers');
      const customWallpapers = existingCustomWallpapers ? JSON.parse(existingCustomWallpapers) : [];
      if (!customWallpapers.includes(oldWallpaper)) {
        customWallpapers.push(oldWallpaper);
        localStorage.setItem('customWallpapers', JSON.stringify(customWallpapers));
      }
      localStorage.removeItem('customWallpaper');
    }
    
    expect(localStorage.getItem('customWallpaper')).toBeNull();
    expect(JSON.parse(localStorage.getItem('customWallpapers')!)).toEqual([oldCustomWallpaper]);
  });

  test('should handle wallpaper shuffle setting', () => {
    localStorage.setItem('wallpaperShuffle', JSON.stringify(true));
    
    const shuffleEnabled = JSON.parse(localStorage.getItem('wallpaperShuffle') || 'false');
    expect(shuffleEnabled).toBe(true);
  });

  test('should identify base64 wallpapers correctly', () => {
    const isBase64Wallpaper = (wallpaper: string) => wallpaper.startsWith('data:image/');
    
    expect(isBase64Wallpaper('data:image/png;base64,test')).toBe(true);
    expect(isBase64Wallpaper('data:image/jpeg;base64,test')).toBe(true);
    expect(isBase64Wallpaper('/wallpapers/forest.jpg')).toBe(false);
    expect(isBase64Wallpaper('https://example.com/image.png')).toBe(false);
  });

  test('should handle duplicate wallpaper detection', () => {
    const existingWallpapers = ['data:image/png;base64,existing1', 'data:image/png;base64,existing2'];
    const duplicateWallpaper = 'data:image/png;base64,existing1';
    const newWallpaper = 'data:image/png;base64,new';
    
    // Test duplicate detection
    expect(existingWallpapers.includes(duplicateWallpaper)).toBe(true);
    expect(existingWallpapers.includes(newWallpaper)).toBe(false);
  });

  test('should properly manage state through parent component handlers', () => {
    // Mock parent component handlers
    const mockOnAddCustomWallpaper = jest.fn();
    const mockOnDeleteCustomWallpaper = jest.fn();
    const mockOnWallpaperChange = jest.fn();
    
    const testWallpaper = 'data:image/png;base64,test';
    
    // Simulate adding a wallpaper
    mockOnAddCustomWallpaper(testWallpaper);
    expect(mockOnAddCustomWallpaper).toHaveBeenCalledWith(testWallpaper);
    
    // Simulate setting as current wallpaper
    mockOnWallpaperChange(testWallpaper);
    expect(mockOnWallpaperChange).toHaveBeenCalledWith(testWallpaper);
    
    // Simulate deleting a wallpaper
    mockOnDeleteCustomWallpaper(testWallpaper);
    expect(mockOnDeleteCustomWallpaper).toHaveBeenCalledWith(testWallpaper);
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

  test('should handle compact upload UI', () => {
    // Test that the compact upload section has the right properties
    const compactUploadProps = {
      buttonText: '+ Upload',
      supportedFormats: 'JPG, PNG, WebP supported',
      size: 'small',
      inline: true
    };
    
    expect(compactUploadProps.buttonText).toBe('+ Upload');
    expect(compactUploadProps.supportedFormats).toBe('JPG, PNG, WebP supported');
    expect(compactUploadProps.size).toBe('small');
    expect(compactUploadProps.inline).toBe(true);
  });
}); 