// backend/modules/website/performance.js

class PerformanceAnalyzer {
  async analyze(page, loadTimeMs) {
    let performanceScore = 100;
    if (loadTimeMs > 4000) {
      performanceScore = 50;
    } else if (loadTimeMs > 2000) {
      performanceScore = 80;
    }

    return {
      load_time_ms: loadTimeMs,
      score: performanceScore
    };
  }
}

module.exports = new PerformanceAnalyzer();
