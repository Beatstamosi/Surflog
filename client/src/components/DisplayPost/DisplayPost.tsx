import { useState, useEffect } from "react";
import type { Post, Session } from "../types/models";
import style from "./DisplayPost.module.css";
import {
  FaHeart,
  FaRegHeart,
  FaRegBookmark,
  FaBookmark,
  FaShare,
  FaRegComment,
} from "react-icons/fa";
import { apiClient } from "../../utils/apiClient";
import { useAuth } from "../Authentication/useAuth";
import DisplayMySession from "../DisplaySession/DisplayMySession/DisplayMySession";

interface DisplayPostProps {
  post: Post;
  onSessionUpdate: (updatedSession: Session) => void;
  onSessionDelete: (sessionToDelete: Session) => void;
}

export default function DisplayPost({
  post,
  onSessionUpdate,
  onSessionDelete,
}: DisplayPostProps) {
  const { user } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);

  const session = post.session;
  const forecast = session?.forecast;
  const creator = post.creator;

  // Check if user has liked/saved post
  useEffect(() => {
    if (user && post.likes) {
      setIsLiked(post.likes.some((like) => like.userId === user.id));
    }
    if (user && post.savedBy) {
      setIsSaved(post.savedBy.some((save) => save.userId === user.id));
    }
  }, [user, post]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await apiClient(`/posts/${post.id}/unlike`, {
          method: "DELETE",
        });
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await apiClient(`/posts/${post.id}/like`, {
          method: "POST",
        });
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await apiClient(`/posts/${post.id}/unsave`, {
          method: "DELETE",
        });
        setIsSaved(false);
      } else {
        await apiClient(`/posts/${post.id}/save`, {
          method: "POST",
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${creator?.firstName}'s surf session at ${forecast?.spotName}`,
          text: `Check out this surf session!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await apiClient(`/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      });

      setComments([...comments, response.comment]);
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  if (!session) {
    return <div>Invalid post: No session data</div>;
  }

  return (
    <div className={style.postContainer}>
      {/* Post Header with Creator Info */}
      <div className={style.postHeader}>
        <div className={style.creatorInfo}>
          <img
            src={creator?.profilePicture}
            alt={`${creator?.firstName} ${creator?.lastName}`}
            className={style.avatar}
          />
          <div className={style.creatorDetails}>
            <span className={style.creatorName}>
              {creator?.firstName} {creator?.lastName}
            </span>
            <span className={style.postTime}>{formatTimeAgo(post.posted)}</span>
          </div>
        </div>
      </div>

      <div>
        <DisplayMySession
          session={post.session!}
          onSessionUpdate={onSessionUpdate}
          onSessionDelete={onSessionDelete}
        />
      </div>

      {/* Action Buttons (Like, Comment, Save, Share) */}
      <div className={style.actionBar}>
        <div className={style.leftActions}>
          <button
            className={`${style.actionButton} ${isLiked ? style.liked : ""}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            {likesCount > 0 && (
              <span className={style.likesCount}>({likesCount})</span>
            )}
          </button>
          <button
            className={style.actionButton}
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <FaRegComment />
            <span className={style.commentsCount}>
              {comments.length > 0 ? `(${comments.length})` : ""}
            </span>
          </button>
          <button className={style.actionButton} onClick={handleShare}>
            <FaShare />
          </button>
        </div>
        <div className={style.rightActions}>
          <button
            className={`${style.actionButton} ${isSaved ? style.saved : ""}`}
            onClick={handleSave}
          >
            {isSaved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className={style.commentsSection}>
        {isCommentsOpen && (
          <div className={style.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={style.commentItem}>
                <img
                  src={comment.author?.profilePicture || "/default-avatar.jpg"}
                  alt={`${comment.author?.firstName}`}
                  className={style.commentAvatar}
                />
                <div className={style.commentContent}>
                  <div className={style.commentText}>
                    <span className={style.commentAuthor}>
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>{" "}
                    {comment.content}
                  </div>
                  <span className={style.commentTime}>
                    {formatTimeAgo(comment.posted)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form className={style.addCommentForm} onSubmit={handleSubmitComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className={style.commentInput}
        />
        <button
          type="submit"
          className={style.postCommentButton}
          disabled={!commentText.trim()}
        >
          Post
        </button>
      </form>
    </div>
  );
}
