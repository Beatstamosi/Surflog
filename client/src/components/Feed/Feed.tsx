import type { Post } from "../types/models";
import { useEffect, useState } from "react";
import style from "./Feed.module.css";
import { apiClient } from "../../utils/apiClient";
import DisplayPost from "../DisplayPost/DisplayPost";

export default function Feed() {
  const [posts, setPosts] = useState<Post[] | null>();
  const [displayPosts, setDisplayPosts] = useState<Post[] | null>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // useEffect fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiClient("/posts/feed/all");
        setPosts(data.posts);
      } catch (err) {
        console.error("Error fetching posts: ", err);
      }
    };
    fetchPosts();
  }, []);

  // useEffect set displayPosts based on view
  useEffect(() => {
    setDisplayPosts(posts);
  }, [posts]);

  // Filter based on search query
  const filteredPosts = displayPosts?.filter((post) => {
    return post.session?.forecast?.spotName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div className={style.filterButtons}>
          <button
            className={`${style.filterButton} ${
              activeFilter === "all" ? style.active : ""
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={`${style.filterButton} ${
              activeFilter === "liked" ? style.active : ""
            }`}
            onClick={() => setActiveFilter("liked")}
          >
            Liked
          </button>
          <button
            className={`${style.filterButton} ${
              activeFilter === "saved" ? style.active : ""
            }`}
            onClick={() => setActiveFilter("saved")}
          >
            Saved
          </button>
          <button
            className={`${style.filterButton} ${
              activeFilter === "following" ? style.active : ""
            }`}
            onClick={() => setActiveFilter("following")}
          >
            Following
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
      </div>

      <div className={style.postsContainer}>
        {filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            if (!post) return null;

            return <DisplayPost key={post.id} post={post} />;
          })
        ) : (
          <div className={style.emptyState}>
            <h3>No sessions found</h3>
            <p>
              {searchQuery
                ? "Try adjusting your search"
                : "Start by adding your first surf session!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
