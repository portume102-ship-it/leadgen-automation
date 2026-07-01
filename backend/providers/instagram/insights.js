// backend/providers/instagram/insights.js

class InstagramInsightsGenerator {
  generateScores(profile) {
    let healthScore = 60;
    if (profile.bio) healthScore += 10;
    if (profile.website) healthScore += 10;
    if (profile.verified) healthScore += 20;

    const consistencyScore = profile.posts_count > 100 ? 90 : (profile.posts_count > 20 ? 70 : 40);

    return {
      health_score: healthScore,
      consistency_score: consistencyScore
    };
  }
}

module.exports = new InstagramInsightsGenerator();
