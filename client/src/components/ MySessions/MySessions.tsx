import type { Session, Post } from "../types/models";
import { useEffect, useState } from "react";
import style from "./MySessions.module.css";
import { apiClient } from "../../utils/apiClient";
import DisplayPost from "../DisplayPost/DisplayPost";
import DisplayMySession from "../DisplaySession/DisplayMySession/DisplayMySession";
import { getRatingNumber } from "../../utils/ratingHelpers";

export default function MySessions() {
  const [view, setView] = useState<"sessions" | "posts">("sessions");
  const [displaySessionsOrPosts, setDisplaySessionsOrPosts] = useState<
    Session[] | Post[] | null
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null); // null means no filter

  const isPost = (item: Session | Post): item is Post => {
    return "creatorId" in item;
  };

  // Helper function to get rating number from Session or Post's session
  const getItemRating = (item: Session | Post): number => {
    if (isPost(item)) {
      // For posts, get rating from the associated session
      return item.session ? getRatingNumber(item.session.rating) : 0;
    } else {
      // For sessions, get rating directly
      return getRatingNumber(item.rating);
    }
  };

  const updateSession = () => {
    if (view === "posts") {
      fetchPosts();
    } else {
      fetchSessions();
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await apiClient("/sessions/user/all");
      setDisplaySessionsOrPosts(data.sessions);
    } catch (err) {
      console.error("Error fetching sessions: ", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await apiClient("/posts/feed/all");
      setDisplaySessionsOrPosts(data.posts);
    } catch (err) {
      console.error("Error fetching posts: ", err);
    }
  };

  useEffect(() => {
    if (view === "sessions") {
      fetchSessions();
    } else if (view === "posts") {
      fetchPosts();
    }
    // Reset rating filter when switching views
    setRatingFilter(null);
  }, [view]);

  // Filter based on search query AND rating filter
  const filteredSessions = displaySessionsOrPosts?.filter((item) => {
    // Apply search filter
    const matchesSearch = searchQuery
      ? isPost(item)
        ? item.session?.forecast?.spotName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        : item.forecast?.spotName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      : true;

    // Apply rating filter
    const matchesRating =
      ratingFilter !== null ? getItemRating(item) === ratingFilter : true;

    return matchesSearch && matchesRating;
  });

  // Clear rating filter
  const clearRatingFilter = () => {
    setRatingFilter(null);
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.filterButtons}>
          <button
            className={`${style.filterButton} ${
              view === "sessions" ? style.filterBtnActive : ""
            }`}
            onClick={() => setView("sessions")}
          >
            Private Sessions
          </button>
          <button
            className={`${style.filterButton} ${
              view === "posts" ? style.filterBtnActive : ""
            }`}
            onClick={() => setView("posts")}
          >
            Shared Sessions
          </button>
        </div>

        <div className={style.searchWrapper}>
          <input
            type="search"
            className={style.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Spot Name"
          />
        </div>

        <div className={style.ratingFilterContainer}>
          <div className={style.ratingStarsFilter}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${style.starFilter} ${
                  ratingFilter === star ? style.starFilterActive : ""
                }`}
                onClick={() =>
                  ratingFilter === star
                    ? clearRatingFilter()
                    : setRatingFilter(star)
                }
                title={`Show ${star} star sessions`}
              >
                ★<span className={style.starNumber}>{star}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={style.sessionsGrid}>
        {filteredSessions && filteredSessions.length > 0 ? (
          <>
            {ratingFilter !== null && (
              <div className={style.filterIndicator}>
                <span className={style.filterText}>
                  Showing {filteredSessions.length} {view} with{" "}
                  <span className={style.ratingHighlight}>
                    {ratingFilter} star{ratingFilter !== 1 ? "s" : ""}
                  </span>{" "}
                  rating
                </span>
              </div>
            )}
            {filteredSessions.map((item) => {
              if (!item) return false;

              if (isPost(item)) {
                return (
                  <DisplayPost
                    key={item.id}
                    post={item}
                    onSessionUpdate={updateSession}
                  />
                );
              } else {
                return (
                  <DisplayMySession
                    key={item.id}
                    session={item}
                    onSessionUpdate={updateSession}
                  />
                );
              }
            })}
          </>
        ) : (
          <div className={style.emptyState}>
            <h3>No sessions found</h3>
            <p>
              {searchQuery || ratingFilter !== null
                ? "Try adjusting your filters"
                : "Start by adding your first surf session!"}
            </p>
            {(searchQuery || ratingFilter !== null) && (
              <button
                className={style.clearAllFiltersButton}
                onClick={() => {
                  setSearchQuery("");
                  setRatingFilter(null);
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
