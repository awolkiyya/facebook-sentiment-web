import type {
    ExecutiveSummaryData,
    FacebookPost,
    FacebookPostAnalytics,
    FacebookPostKpis,
    TopicInsight,
  } from "../types/facebook-post"
  
  // =========================================================
  // KPI CALCULATION
  // =========================================================
  
  export function calculatePostKpis(
    posts: FacebookPost[],
  ): FacebookPostKpis {
    return {
      posts: posts.length,
  
      reactions: posts.reduce(
        (total, post) => total + post.reactions,
        0,
      ),
  
      comments: posts.reduce(
        (total, post) => total + post.comments,
        0,
      ),
  
      shares: posts.reduce(
        (total, post) => total + post.shares,
        0,
      ),
    }
  }
  
  // =========================================================
  // EXECUTIVE SUMMARY
  // =========================================================
  
  export function calculateExecutiveSummary(
    posts: FacebookPost[],
  ): ExecutiveSummaryData {
    const totalPosts = posts.length
  
    if (totalPosts === 0) {
      return {
        totalPosts: 0,
        positivePosts: 0,
        neutralPosts: 0,
        negativePosts: 0,
        positivePercentage: 0,
        neutralPercentage: 0,
        negativePercentage: 0,
      }
    }
  
    const positivePosts = posts.filter(
      (post) => post.sentiment === "positive",
    ).length
  
    const neutralPosts = posts.filter(
      (post) => post.sentiment === "neutral",
    ).length
  
    const negativePosts = posts.filter(
      (post) => post.sentiment === "negative",
    ).length
  
    return {
      totalPosts,
      positivePosts,
      neutralPosts,
      negativePosts,
  
      positivePercentage:
        (positivePosts / totalPosts) * 100,
  
      neutralPercentage:
        (neutralPosts / totalPosts) * 100,
  
      negativePercentage:
        (negativePosts / totalPosts) * 100,
    }
  }
  
  // =========================================================
  // TOPICS
  // =========================================================
  //
  // NOTE:
  // This currently aggregates POST topics because the current
  // mock/API post model contains post.topic.
  //
  // Later, this should be replaced with COMMENT topic analytics
  // from your AI service.
  //
  
  export function calculateTopicInsights(
    posts: FacebookPost[],
  ): TopicInsight[] {
    const topics = new Map<
      string,
      {
        count: number
        negative: number
        comments: number
      }
    >()
  
    for (const post of posts) {
      const current = topics.get(post.topic) ?? {
        count: 0,
        negative: 0,
        comments: 0,
      }
  
      current.count += 1
      current.comments += post.comments
  
      if (post.sentiment === "negative") {
        current.negative += 1
      }
  
      topics.set(post.topic, current)
    }
  
    return Array.from(topics.entries())
      .map(([topic, value]) => ({
        topic,
        count: value.count,
        negative: value.negative,
        comments: value.comments,
      }))
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 4)
  }
  
  // =========================================================
  // MOST DISCUSSED POST
  // =========================================================
  
  export function calculateMostDiscussedPost(
    posts: FacebookPost[],
  ): FacebookPost | null {
    if (posts.length === 0) {
      return null
    }
  
    return [...posts].sort(
      (a, b) => b.comments - a.comments,
    )[0] ?? null
  }
  
  // =========================================================
  // COMPLETE ANALYTICS
  // =========================================================
  
  export function calculateFacebookPostAnalytics(
    posts: FacebookPost[],
  ): FacebookPostAnalytics {
    return {
      kpis: calculatePostKpis(posts),
  
      executiveSummary:
        calculateExecutiveSummary(posts),
  
      topics:
        calculateTopicInsights(posts),
  
      mostDiscussedPost:
        calculateMostDiscussedPost(posts),
    }
  }