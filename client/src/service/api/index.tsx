// Types
export type { AuthResponse, ApiError } from "./types";

// Auth
export { apiRegister, apiLogin, apiGetMe } from "./auth";

// Users
export { apiGetUserByUsername, apiUpdateProfile } from "./user";

// Follow
export { apiFollowUser, apiUnfollowUser, apiGetFollowers, apiGetFollowing } from "./follow";

// Tweets
export { apiCreateTweet, apiGetFeed, apiGetGlobalFeed, apiGetTrendingFeed, apiGetUserTweets, apiUpdateTweet, apiDeleteTweet, apiLikeTweet, apiUnlikeTweet, apiRetweetTweet, apiUnretweetTweet } from "./tweet";
export type { Tweet } from "./tweet";

// Notifications
export { apiGetNotifications, apiGetUnreadCount, apiMarkAllAsRead } from "./notification";
export type { Notification } from "./notification";

// HTTP & helpers
export {
  saveAuth,
  getToken,
  getRefreshToken,
  getStoredUser,
  logout,
  isAuthenticated,
  fetchWithAuth,
} from "./http";
