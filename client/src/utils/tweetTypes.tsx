import type { Tweet } from "../service/api";

export interface TweetCardProps {
  tweet: Tweet;
  currentUserId?: string;
  /** Appelé après une mise à jour réussie, avec le tweet mis à jour */
  onUpdated?: (updated: Tweet) => void;
  /** Appelé après une suppression réussie, avec l'id du tweet */
  onDeleted?: (id: string) => void;
  /** Appelé après un like/unlike, avec l'id, isLiked et le nouveau count */
  onLikeChanged?: (id: string, isLiked: boolean, likes: number) => void;
  /** Appelé après un retweet réussi, avec le nouveau tweet retweet */
  onRetweeted?: (retweet: Tweet) => void;
  /** Masquer le lien vers le profil (utile sur la page profil) */
  hideAuthorLink?: boolean;
}
