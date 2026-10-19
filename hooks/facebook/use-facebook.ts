
// "use client"

// import { useFacebookPages } from "./use-facebook-pages"
// import { useFacebookPosts } from "./use-facebook-posts"

// /**
//  * Central hook for Facebook pages and posts.
//  *
//  * Post-specific comments and analytics are handled by
//  * use-facebook-comments.ts.
//  */
// export function useFacebook() {
//   const pages = useFacebookPages()
//   const posts = useFacebookPosts()

//   return {
//     // Pages
//     ...pages,

//     // Posts
//     posts: posts.posts,
//     postsPagination: posts.pagination,
//     isLoadingPosts: posts.isLoading,
//     isSyncingPosts: posts.isSyncing,
//     getPosts: posts.getPosts,
//     syncPosts: posts.syncPosts,
//     clearPosts: posts.clearPosts,
//   }
// }
