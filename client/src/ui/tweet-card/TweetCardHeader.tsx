import { Link as RouterLink } from "react-router-dom";

interface TweetCardHeaderProps {
  username: string;
  dateLabel: string;
  hideAuthorLink: boolean;
}

export function TweetCardHeader({ username, dateLabel, hideAuthorLink }: TweetCardHeaderProps) {
  return (
    <div className="tweet-card-header">
      <div className="tweet-card-info">
        {hideAuthorLink ? (
          <span className="tweet-card-author">@{username}</span>
        ) : (
          <RouterLink to={`/profile/${username}`}>
            <span className="tweet-card-author">@{username}</span>
          </RouterLink>
        )}
        <span className="tweet-card-date">{dateLabel}</span>
      </div>
    </div>
  );
}
