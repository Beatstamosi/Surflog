import type { Session, Post } from "../types/models";
import { useEffect, useState } from "react";
import style from "./MySessions.module.css";
import { apiClient } from "../../utils/apiClient";
import DisplayPost from "../DisplayPost/DisplayPost";
import DisplayMySession from "../DisplaySession/DisplayMySession/DisplayMySession";
import { getRatingNumber } from "../../utils/ratingHelpers";

type SortOption =
  | "stars-desc"
  | "stars-asc"
  | "date-desc"
  | "date-asc"
  | "duration-desc"
  | "duration-asc";

export default function MySessions() {
  const [view, setView] = useState<"sessions" | "posts">("sessions");
  const [displaySessionsOrPosts, setDisplaySessionsOrPosts] = useState<
    Session[] | Post[] | null
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const isPost = (item: Session | Post): item is Post => {
    return "creatorId" in item;
  };

  // Helper function to get rating number from Session or Post's session
  const getItemRating = (item: Session | Post): number => {
    if (isPost(item)) {
      return item.session ? getRatingNumber(item.session.rating) : 0;
    } else {
      return getRatingNumber(item.rating);
    }
  };

  // Helper function to get date from Session or Post
  const getItemDate = (item: Session | Post): Date => {
    if (isPost(item)) {
      // For posts, use the post date
      return new Date(item.posted);
    } else {
      // For sessions, use the start time
      return new Date(item.startTime);
    }
  };

  // Helper function to calculate session duration in minutes
  const getItemDuration = (item: Session | Post): number => {
    if (isPost(item)) {
      if (!item.session) return 0;
      const start = new Date(item.session.startTime);
      const end = new Date(item.session.endTime);
      return (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
    } else {
      const start = new Date(item.startTime);
      const end = new Date(item.endTime);
      return (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
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
      const data = await apiClient("/posts/user/all");
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
    // Reset filters when switching views
    setRatingFilter(null);
  }, [view]);

  // Filter based on search query AND rating filter
  const filteredItems = displaySessionsOrPosts?.filter((item) => {
    const matchesSearch = searchQuery
      ? isPost(item)
        ? item.session?.forecast?.spotName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        : item.forecast?.spotName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      : true;

    const matchesRating =
      ratingFilter !== null ? getItemRating(item) === ratingFilter : true;

    return matchesSearch && matchesRating;
  });

  // Sort the filtered items
  const sortedAndFilteredItems = filteredItems?.slice().sort((a, b) => {
    switch (sortOption) {
      case "stars-desc":
        return getItemRating(b) - getItemRating(a);
      case "stars-asc":
        return getItemRating(a) - getItemRating(b);
      case "date-desc":
        return getItemDate(b).getTime() - getItemDate(a).getTime();
      case "date-asc":
        return getItemDate(a).getTime() - getItemDate(b).getTime();
      case "duration-desc":
        return getItemDuration(b) - getItemDuration(a);
      case "duration-asc":
        return getItemDuration(a) - getItemDuration(b);
      default:
        return getItemDate(b).getTime() - getItemDate(a).getTime();
    }
  });

  // Clear rating filter
  const clearRatingFilter = () => {
    setRatingFilter(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setRatingFilter(null);
  };

  // Format sort option for display
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case "stars-desc":
        return "Stars (High to Low)";
      case "stars-asc":
        return "Stars (Low to High)";
      case "date-desc":
        return "Date (Newest First)";
      case "date-asc":
        return "Date (Oldest First)";
      case "duration-desc":
        return "Duration (Longest First)";
      case "duration-asc":
        return "Duration (Shortest First)";
      default:
        return "Sort by";
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "date-desc", label: "Date (Newest First)" },
    { value: "date-asc", label: "Date (Oldest First)" },
    { value: "stars-desc", label: "Stars (High to Low)" },
    { value: "stars-asc", label: "Stars (Low to High)" },
    { value: "duration-desc", label: "Duration (Longest First)" },
    { value: "duration-asc", label: "Duration (Shortest First)" },
  ];

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

        <div className={style.searchSortRow}>
          <div className={style.searchWrapper}>
            <input
              type="search"
              className={style.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for Spot Name"
            />
          </div>

          <div className={style.sortContainer}>
            <button
              className={style.sortButton}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span>{getSortLabel(sortOption)}</span>
              <span className={style.sortArrow}>
                {showSortDropdown ? "▲" : "▼"}
              </span>
            </button>

            {showSortDropdown && (
              <div className={style.sortDropdown}>
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${style.sortOption} ${
                      sortOption === option.value ? style.sortOptionActive : ""
                    }`}
                    onClick={() => {
                      setSortOption(option.value);
                      setShowSortDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
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
      </div>

      <div className={style.sessionsGrid}>
        {(searchQuery || ratingFilter) && (
          <div className={style.activeFilters}>
            <div className={style.filterTags}>
              {searchQuery && (
                <span className={style.filterTag}>
                  Search: "{searchQuery}"
                  <button
                    className={style.filterTagRemove}
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                </span>
              )}
              {ratingFilter !== null && (
                <span className={style.filterTag}>
                  {ratingFilter} star rating
                  <button
                    className={style.filterTagRemove}
                    onClick={clearRatingFilter}
                  >
                    ×
                  </button>
                </span>
              )}
              {(searchQuery || ratingFilter !== null) && (
                <button
                  className={style.clearAllFilters}
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              )}
            </div>
            <div className={style.sortIndicator}>
              Sorted by: <strong>{getSortLabel(sortOption)}</strong>
            </div>
          </div>
        )}

        {sortedAndFilteredItems && sortedAndFilteredItems.length > 0 ? (
          sortedAndFilteredItems.map((item) => {
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
          })
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
                onClick={clearAllFilters}
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
