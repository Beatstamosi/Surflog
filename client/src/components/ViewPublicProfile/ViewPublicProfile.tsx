import { useParams } from "react-router-dom";
import style from "./ViewPublicProfile.module.css";
import { useEffect, useState } from "react";
import { apiClient } from "../../utils/apiClient";
import type { User, Board, Session, Post } from "../types/models";
import { useAuth } from "../Authentication/useAuth";
import DisplayPost from "../DisplayPost/DisplayPost";
import surfBoardSessionSVG from "../../assets/surfboard_session.svg";
import { Link } from "react-router-dom";
import { FiEdit } from "react-icons/fi";

interface PublicUser extends User {
  boards: Board[];
  sessions: Session[];
  posts: Post[];
  _count: {
    followers: number;
    following: number;
  };
  isFollowing: boolean;
}

export default function ViewPublicProfile() {
  const [profileData, setProfileData] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profileId } = useParams();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient(`/user/${profileId}/public`);
        setProfileData(data.user);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [profileId]);

  const handleFollow = async () => {
    if (!profileData) return;

    try {
      if (profileData.isFollowing) {
        await apiClient(`/user/${profileId}/unfollow`, { method: "DELETE" });
      } else {
        await apiClient(`/user/${profileId}/follow`, { method: "POST" });
      }
      // Refresh profile data to update follow status
      const data = await apiClient(`/user/${profileId}/public`);
      setProfileData(data.user);
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  const calculateTotalWaterTime = (sessions: Session[]) => {
    return sessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const duration = end.getTime() - start.getTime();
      return total + duration;
    }, 0);
  };

  const formatWaterTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <div className={style.loading}>Loading profile...</div>;
  }

  if (!profileData) {
    return <div className={style.error}>User not found</div>;
  }

  const totalWaterTime = calculateTotalWaterTime(profileData.sessions);
  const isOwnProfile = currentUser?.id === profileData.id;

  return (
    <div className={style.publicProfileContent}>
      {/* Header Section */}
      <div className={style.profileHeader}>
        <div className={style.avatarSection}>
          <img
            src={profileData.profilePicture}
            alt={`${profileData.firstName} ${profileData.lastName}`}
            className={style.avatar}
          />
        </div>

        <div className={style.profileInfo}>
          <div className={style.profileTop}>
            <h1 className={style.userName}>
              {profileData.firstName} {profileData.lastName}
            </h1>
            {isOwnProfile && (
              <Link to="/edit-profile">
                <FiEdit />
              </Link>
            )}
            {!isOwnProfile && (
              <button
                className={`${style.followButton} ${
                  profileData.isFollowing ? style.following : ""
                }`}
                onClick={handleFollow}
              >
                {profileData.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <div className={style.stats}>
            <div className={style.stat}>
              <span className={style.statNumber}>
                {profileData._count?.followers || 0}
              </span>
              <span className={style.statLabel}>Followers</span>
            </div>
            <div className={style.stat}>
              <span className={style.statNumber}>
                {profileData._count?.following || 0}
              </span>
              <span className={style.statLabel}>Following</span>
            </div>
            <div className={style.stat}>
              <span className={style.statNumber}>
                {profileData.sessions.length}
              </span>
              <span className={style.statLabel}>Sessions</span>
            </div>
            <div className={style.stat}>
              <span className={style.statNumber}>
                {formatWaterTime(totalWaterTime)}
              </span>
              <span className={style.statLabel}>Water Time</span>
            </div>
          </div>

          {/* Bio Section */}
          <div className={style.bioSection}>
            <p className={style.bio}>{profileData.bio}</p>
          </div>

          {/* Quiver Section */}
          {profileData.boards && profileData.boards.length > 0 && (
            <div className={style.quiverSection}>
              <div className={style.quiverList}>
                {profileData.boards.map((board) => (
                  <div key={board.id} className={style.boardItem}>
                    <img
                      src={surfBoardSessionSVG}
                      alt=""
                      className={style.boardIcon}
                    />
                    <span className={style.boardDetails}>
                      {board.brand} • {board.name} • {board.size} •{" "}
                      {board.volume}L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className={style.postsSection}>
        {profileData.posts && profileData.posts.length > 0 ? (
          <div className={style.postsGrid}>
            {profileData.posts.map((post) => (
              <DisplayPost key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className={style.emptyPosts}>
            <p>No shared sessions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
