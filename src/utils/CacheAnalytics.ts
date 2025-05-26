// Cache Analytics Utility for Performance Monitoring
export class CacheAnalytics {
  private static readonly ANALYTICS_KEY = 'widgetopia_cache_analytics';
  private static readonly ANALYTICS_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  static trackCacheHit(widget: string, cacheType: string): void {
    try {
      const analytics = this.getAnalytics();
      const key = `${widget}_${cacheType}`;
      
      if (!analytics[key]) {
        analytics[key] = { hits: 0, misses: 0, lastUpdated: Date.now() };
      }
      
      analytics[key].hits++;
      analytics[key].lastUpdated = Date.now();
      
      this.saveAnalytics(analytics);
    } catch (error) {
      console.warn('Error tracking cache hit:', error);
    }
  }

  static trackCacheMiss(widget: string, cacheType: string): void {
    try {
      const analytics = this.getAnalytics();
      const key = `${widget}_${cacheType}`;
      
      if (!analytics[key]) {
        analytics[key] = { hits: 0, misses: 0, lastUpdated: Date.now() };
      }
      
      analytics[key].misses++;
      analytics[key].lastUpdated = Date.now();
      
      this.saveAnalytics(analytics);
    } catch (error) {
      console.warn('Error tracking cache miss:', error);
    }
  }

  static getCacheStats(): Record<string, { hits: number; misses: number; hitRate: number }> {
    try {
      const analytics = this.getAnalytics();
      const stats: Record<string, { hits: number; misses: number; hitRate: number }> = {};
      
      Object.entries(analytics).forEach(([key, data]) => {
        const total = data.hits + data.misses;
        stats[key] = {
          hits: data.hits,
          misses: data.misses,
          hitRate: total > 0 ? (data.hits / total) * 100 : 0
        };
      });
      
      return stats;
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return {};
    }
  }

  static logPerformanceReport(): void {
    try {
      const stats = this.getCacheStats();
      
      console.group('🚀 Widgetopia Cache Performance Report');
      console.log(`📅 Generated: ${new Date().toLocaleString()}`);
      console.log('─'.repeat(60));
      
      Object.entries(stats).forEach(([key, data]) => {
        const [widget, cacheType] = key.split('_');
        console.log(`📦 ${widget.toUpperCase()} (${cacheType}):`);
        console.log(`   ✅ Cache Hits: ${data.hits}`);
        console.log(`   ❌ Cache Misses: ${data.misses}`);
        console.log(`   📊 Hit Rate: ${data.hitRate.toFixed(1)}%`);
        console.log('');
      });
      
      const overallStats = this.getOverallStats(stats);
      console.log('📈 Overall Performance:');
      console.log(`   🎯 Total Requests: ${overallStats.totalRequests}`);
      console.log(`   ⚡ Cache Efficiency: ${overallStats.overallHitRate.toFixed(1)}%`);
      console.log(`   💾 Storage Saved: ~${overallStats.estimatedDataSaved}MB`);
      
      console.groupEnd();
    } catch (error) {
      console.warn('Error generating performance report:', error);
    }
  }

  private static getAnalytics(): Record<string, { hits: number; misses: number; lastUpdated: number }> {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      if (!stored) return {};
      
      const analytics = JSON.parse(stored);
      
      // Clean up expired entries
      const now = Date.now();
      Object.keys(analytics).forEach(key => {
        if (now - analytics[key].lastUpdated > this.ANALYTICS_EXPIRY) {
          delete analytics[key];
        }
      });
      
      return analytics;
    } catch (error) {
      console.warn('Error reading analytics:', error);
      return {};
    }
  }

  private static saveAnalytics(analytics: Record<string, any>): void {
    try {
      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.warn('Error saving analytics:', error);
    }
  }

  private static getOverallStats(stats: Record<string, any>) {
    const totalHits = Object.values(stats).reduce((sum: number, data: any) => sum + data.hits, 0);
    const totalMisses = Object.values(stats).reduce((sum: number, data: any) => sum + data.misses, 0);
    const totalRequests = totalHits + totalMisses;
    const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
    
    // Estimate data saved (rough calculation based on average request sizes)
    const avgImageSize = 0.05; // 50KB average
    const avgIframeSize = 0.5;  // 500KB average
    const avgWeatherSize = 0.01; // 10KB average
    
    const estimatedDataSaved = (
      (stats.quicklinks_image?.hits || 0) * avgImageSize +
      (stats.music_iframe?.hits || 0) * avgIframeSize +
      (stats.weather_api?.hits || 0) * avgWeatherSize
    );
    
    return {
      totalRequests,
      overallHitRate,
      estimatedDataSaved: estimatedDataSaved.toFixed(2)
    };
  }

  static clearAnalytics(): void {
    try {
      localStorage.removeItem(this.ANALYTICS_KEY);
    } catch (error) {
      console.warn('Error clearing analytics:', error);
    }
  }
}

// Auto-generate performance report every 10 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    CacheAnalytics.logPerformanceReport();
  }, 10 * 60 * 1000); // 10 minutes
} 