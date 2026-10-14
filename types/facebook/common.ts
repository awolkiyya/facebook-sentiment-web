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