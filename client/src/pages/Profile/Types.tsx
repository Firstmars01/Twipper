import type { AuthResponse } from "../../service/api";
import type { FollowUser } from "../../ui/follow-list-dialog/FollowListDialog";
import { apiGetFollowers, apiGetFollowing } from "../../service/api";

export type UserProfile = AuthResponse["user"] & {
  _count: { tweets: number; followers: number; following: number };
  isFollowing: boolean;
};

export type DialogKind = "followers" | "following";

export const DIALOG_CONFIG: Record<DialogKind, { title: string; fetcher: (u: string) => Promise<FollowUser[]> }> = {
  followers: { title: "Abonnés", fetcher: apiGetFollowers },
  following: { title: "Abonnements", fetcher: apiGetFollowing },
};
