import type { FacebookPost } from "@/types/facebook/post"
import type { LanguageCode } from "@/types/facebook/common"
import { PostTopic, Sentiment, UiComment } from "@/types/facebook/post-comments-analytics"


/** Flip to false to use the real API hooks. */
export const USE_MOCK_DATA = true
export const MOCK_NOW = "2026-09-26T23:59:59"

const MOCK_AUTHORS = [
  "Abebe Kebede",
  "Hana Mohammed",
  "Mekonnen Tadesse",
  "Fatuma Ali",
  "Dawit Girma",
  "Ahmed Nur",
  "Selamawit Bekele",
  "Tesfaye Worku",
  "Aster Alemu",
  "Kedir Hussein",
  "Meron Fikadu",
  "Yonas Abebe",
  "Rahma Abdisa",
  "Bereket Solomon",
  "Nuru Ahmed",
  "Liya Tesfaye",
  "Sara Mulu",
  "Girma Tolla",
  "Ruth Assefa",
  "Sami Yusuf",
]

const POSITIVE_MSGS = [
  "This is a very good initiative. We appreciate the work being done for the city.",
  "The improvement is encouraging. Please continue with the same effort.",
  "Excellent work. The city is changing and we can see the difference.",
  "Very happy to see this progress. Keep going.",
  "This is exactly the kind of development our city needs.",
  "Thank you for listening to the community.",
]

const NEUTRAL_MSGS = [
  "When will this project reach the eastern part of the city?",
  "Can you provide more information about the next phase?",
  "The information is clear. We will wait for the next update.",
  "I hope the implementation will continue according to the plan.",
]

const NEGATIVE_MSGS = [
  "We need more attention to the roads in our neighborhood.",
  "Please also improve waste collection around the market area.",
  "There are still some problems that need to be addressed.",
  "Please make sure all neighborhoods receive equal attention.",
]

const POSITIVE_MSGS_AM = [
  "በጣም ጥሩ ስራ ነው፣ እናመሰግናለን።",
  "ይህ መሻሻል በጣም ያበረታታል፣ በዚሁ ይቀጥሉ።",
  "ከተማችን እየተለወጠ ነው፣ ይህን ማየት ያስደስታል።",
]

const NEUTRAL_MSGS_AM = [
  "ይህ ፕሮጀክት መቼ ወደ ምስራቅ ከተማ ክፍል ይደርሳል?",
  "ስለ ቀጣዩ ደረጃ ተጨማሪ መረጃ ማግኘት እንችላለን?",
]

const NEGATIVE_MSGS_AM = [
  "በአካባቢያችን ላሉ መንገዶች ተጨማሪ ትኩረት ያስፈልጋል።",
  "የቆሻሻ አሰባሰብ አገልግሎት መሻሻል አለበት።",
]

const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]

function daysAgoIso(days: number, hour = 9) {
  const d = new Date(MOCK_NOW)
  d.setDate(d.getDate() - days)
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0)
  return d.toISOString()
}

function pickSentimentConfidence(sentiment: Sentiment) {
  return sentiment === "neutral"
    ? 55 + Math.floor(Math.random() * 28)
    : 76 + Math.floor(Math.random() * 23)
}

function buildMockComments(): UiComment[] {
  const out: UiComment[] = []
  let id = 1

  for (let day = 44; day >= 0; day--) {
    const recentBoost = day <= 14 ? 1 : 0
    const count = 1 + Math.floor(Math.random() * (2 + recentBoost * 2))

    for (let i = 0; i < count; i++) {
      const roll = Math.random()
      const positiveChance = day <= 14 ? 0.62 : 0.4
      const negativeChance = day <= 14 ? 0.16 : 0.32

      let sentiment: Sentiment
      let pool: string[]
      let poolAm: string[]

      if (roll < positiveChance) {
        sentiment = "positive"
        pool = POSITIVE_MSGS
        poolAm = POSITIVE_MSGS_AM
      } else if (roll < positiveChance + negativeChance) {
        sentiment = "negative"
        pool = NEGATIVE_MSGS
        poolAm = NEGATIVE_MSGS_AM
      } else {
        sentiment = "neutral"
        pool = NEUTRAL_MSGS
        poolAm = NEUTRAL_MSGS_AM
      }

      const language: LanguageCode = Math.random() < 0.3 ? "am" : "en"
      const iso = daysAgoIso(day)

      out.push({
        id: String(id++),
        author: pickOne(MOCK_AUTHORS),
        message: language === "am" ? pickOne(poolAm) : pickOne(pool),
        publishedAt: iso,
        sentiment,
        sentimentConfidence: pickSentimentConfidence(sentiment),
        language,
        likes: Math.floor(Math.random() * 60),
        permalinkUrl: "https://facebook.com/",
        analyzedAt: iso,
      })
    }
  }

  return out.reverse()
}

export const MOCK_COMMENTS = buildMockComments()

export const MOCK_POST = {
  id: "mock-post",
  facebook_post_id: "mock-facebook-post",
  message:
    "We are pleased to share the latest development update with the community.",
  published_at: "2026-09-18T08:00:00",
  permalink_url: "https://facebook.com/",
  engagement: {
    likes: 1250,
    comments: MOCK_COMMENTS.length,
    shares: 87,
  },
} as FacebookPost

export const MOCK_POST_TOPICS: PostTopic[] = [
  { topic: "Infrastructure & road development", score: 82 },
  { topic: "Community engagement", score: 64 },
  { topic: "Public services & waste management", score: 47 },
  { topic: "Project timeline & updates", score: 33 },
]