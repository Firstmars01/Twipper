import { Box, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import Page404 from "../page404/Page404";
import FollowListDialog from "../../ui/followListDialog/FollowListDialog";
import TweetList from "../../ui/tweet-list/TweetList";
import ProfileEditForm from "../../ui/profileEditForm/ProfileEditForm";
import { useProfile } from "./Functions";
import "./Style.css";

function Profile() {
  const {
    user,
    loading,
    notFound,
    currentUser,
    isOwnProfile,
    followLoading,
    handleFollow,
    dialogOpen,
    setDialogOpen,
    dialogTitle,
    dialogUsers,
    dialogLoading,
    openDialog,
    tweets,
    tweetsLoading,
    handleTweetUpdated,
    handleTweetDeleted,
    handleLikeChanged,
    handleRetweeted,
    editing,
    setEditing,
    handleProfileSaved,
  } = useProfile();

  if (loading) {
    return (
      <Box className="profile-loading">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (notFound || !user) return <Page404 />;

  return (
    <Box className="profile">
      <Box
        className="profile-banner"
        style={{ background: user.flag || "linear-gradient(135deg, #1da1f2, #0d8ecf)" }}
      />
      <Box className="profile-body">
        {user.avatar ? (
          <img className="profile-avatar" src={user.avatar} alt={user.username} />
        ) : (
          <Box className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </Box>
        )}
        <Box className="profile-header">
          <Box>
            <Heading className="profile-title">@{user.username}</Heading>
            <Text className="profile-subtitle">{user.bio || "Aucune bio"}</Text>
          </Box>
          {isOwnProfile ? (
            <Button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
              size="sm"
            >
              Modifier le profil
            </Button>
          ) : currentUser ? (
            <Button
              className={`follow-btn ${user.isFollowing ? "following" : ""}`}
              onClick={handleFollow}
              disabled={followLoading}
              size="sm"
            >
              {followLoading ? "..." : user.isFollowing ? "Abonné" : "Suivre"}
            </Button>
          ) : null}
        </Box>

        {editing && (
          <ProfileEditForm
            currentUsername={user.username}
            currentBio={user.bio || ""}
            currentFlag={user.flag}
            onSaved={handleProfileSaved}
            onCancel={() => setEditing(false)}
          />
        )}

        <Box className="profile-stats">
          <Text><strong>{user._count.tweets}</strong> tweets</Text>
          {isOwnProfile ? (
            <>
              <Text className="stat-link" onClick={() => openDialog("followers")}>
                <strong>{user._count.followers}</strong> abonnés
              </Text>
              <Text className="stat-link" onClick={() => openDialog("following")}>
                <strong>{user._count.following}</strong> abonnements
              </Text>
            </>
          ) : (
            <>
              <Text><strong>{user._count.followers}</strong> abonnés</Text>
              <Text><strong>{user._count.following}</strong> abonnements</Text>
            </>
          )}
        </Box>
      </Box>

      {/* Tweets de l'utilisateur */}
      <Box className="profile-tweets">
        <Heading className="profile-tweets-title">
          Tweets
        </Heading>

        {tweetsLoading ? (
          <Box className="profile-spinner">
            <Spinner />
          </Box>
        ) : (
          <TweetList
            tweets={tweets}
            currentUserId={currentUser?.id}
            emptyMessage="Aucun tweet pour le moment."
            onUpdated={handleTweetUpdated}
            onDeleted={handleTweetDeleted}
            onLikeChanged={handleLikeChanged}
            onRetweeted={handleRetweeted}
            hideAuthorLink
          />
        )}
      </Box>

      <FollowListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        users={dialogUsers}
        loading={dialogLoading}
      />
    </Box>
  );
}

export default Profile;
