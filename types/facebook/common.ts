export type SentimentLabel =
  | "negative"
  | "neutral"
  | "positive"

  export type LanguageCode =
  | "am"
  | "om"
  | "en"
  | "mixed"

export type PostType =
  | "text"
  | "photo"
  | "video"
  | "link"

export type SortMode =
  | "recent"
  | "engagement"

export type SentimentFilter =
  | "all"
  | SentimentLabel


export type CommentSortMode =
  | "newest"
  | "oldest"
  | "most_liked"
  | "most_replies"
  | "highest_sentiment_confidence"
  | "highest_priority"


  export type DateRange = "7d" | "30d" | "90d" | "all" | "custom"

  export type CommentAnalysisStatus =
  | "pending"
  | "completed"



  export type CommentDatePreset =
  | "all"
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "custom";