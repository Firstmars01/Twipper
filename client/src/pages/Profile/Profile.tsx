import { Box, Heading, Text, Spinner, Button, VStack } from "@chakra-ui/react";
import Page404 from "../page404/Page404";
import FollowListDialog from "../../ui/follow-list-dialog/FollowListDialog";
import TweetCard from "../../ui/tweet-card/TweetCard";
import ProfileEditForm from "../../ui/profile-edit-form/ProfileEditForm";
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
      <Box className="profile-banner" />
      <Box className="profile-body">
        <Box className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </Box>
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
        <Heading size="md" mb={4}>
          Tweets
        </Heading>

        {tweetsLoading ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" />
          </Box>
        ) : tweets.length === 0 ? (
          <Text color="gray.500" textAlign="center">
            Aucun tweet pour le moment.
          </Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                currentUserId={currentUser?.id}
                onUpdated={handleTweetUpdated}
                onDeleted={handleTweetDeleted}
                onLikeChanged={handleLikeChanged}
                onRetweeted={handleRetweeted}
                hideAuthorLink
              />
            ))}
          </VStack>
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
