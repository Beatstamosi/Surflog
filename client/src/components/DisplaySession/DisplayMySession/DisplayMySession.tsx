import { useState, useEffect, useRef } from "react";
import type { Session } from "../../types/models";
import style from "./DisplayMySession.module.css";
import { FaEdit } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import surfBoardSessionSVG from "../../../assets/surfboard_session.svg";
import radarSVG from "../../../assets/radar.svg";
import watchIcon from "../../../assets/watch.svg";
import EditSession from "../../EditSession/EditSession";
import getRatingClass from "../../../utils/getRatingClass";
import ForecastDisplay from "../../ForecastDisplay/ForecastDisplay";
import { transformForecastToReport } from "../../../utils/transformForecastToReport";
import { apiClient } from "../../../utils/apiClient";
import deleteSessionImageFromStorage from "../../../utils/deleteSessionImageFromStorage";
import { calculateSessionDuration } from "../../../utils/calculateSessionDuration";
import { getRatingNumber } from "../../../utils/ratingHelpers";
import { useAuth } from "../../Authentication/useAuth";

interface DisplaySessionProps {
  session: Session;
  onSessionUpdate?: () => void;
}

export default function DisplayMySession({
  session,
  onSessionUpdate,
}: DisplaySessionProps) {
  const [isShared, setIsShared] = useState(session.shared);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editSession, setEditSession] = useState(false);
  const [sessionSharedToggled, setSessionSharedToggled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const forecast = session.forecast;
  const board = session.board;
  const ratingClass = style[getRatingClass(session.forecast?.ratingValue || 1)];
  const sessionDuration = calculateSessionDuration(
    session.startTime,
    session.endTime
  );
  const { user } = useAuth();
  const isOwner =
    session.userId === user?.id && onSessionUpdate && onSessionUpdate;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract wave height from size string
  const getWaveHeight = (size: string) => {
    return size?.replace("Surf: ", "") || "N/A";
  };

  // Generate forecast summary for collapsed state
  const getForecastSummary = () => {
    if (!forecast) return "No forecast data";

    const waveHeight = getWaveHeight(forecast.size);
    const wind = `${forecast.windSpeed} ${forecast.windDirection}`;

    return `${waveHeight}m • ${wind}`;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditSession = (e: React.MouseEvent) => {
    e.preventDefault();

    setEditSession(true);
    setIsMenuOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await apiClient("/sessions", {
        method: "DELETE",
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (session.image) {
        await deleteSessionImageFromStorage(session.image);
      }

      if (onSessionUpdate) onSessionUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleShared = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsShared(e.target.checked);

    try {
      await apiClient("/sessions/shared", {
        method: "PUT",
        body: JSON.stringify({ sessionId: session.id, shared: session.shared }),
      });

      showToggleConfirmation();
    } catch (err) {
      console.error(err);
    }
  };

  const showToggleConfirmation = () => {
    setSessionSharedToggled(true);

    setTimeout(() => {
      setSessionSharedToggled(false);
      if (onSessionUpdate) onSessionUpdate();
    }, 1500);
  };

  if (sessionSharedToggled) {
    const emoji = session.shared === true ? "🚫" : "🤙";
    const info = session.shared === true ? "Post unshared!" : "Session shared!";
    return (
      <div className={style.sessionSharedToggle}>
        <p>{emoji}</p>
        <p>{info}</p>
      </div>
    );
  }

  return (
    <div className={style.sessionContainer}>
      {editSession && isOwner ? (
        <EditSession
          session={session}
          setEditSession={setEditSession}
          onSessionUpdate={onSessionUpdate}
        />
      ) : (
        <>
          {/* 3-dot dropdown menu */}
          {isOwner && (
            <div className={style.menuContainer} ref={menuRef}>
              <button
                className={style.menuButton}
                onClick={handleMenuToggle}
                title="More options"
              >
                <CiMenuKebab size={"1.5em"} />
              </button>

              {isMenuOpen && (
                <div className={style.dropdownMenu}>
                  <div className={style.menuItem}>
                    <label className={style.menuToggle}>
                      <span>Share</span>
                      <div className={style.toggleContainer}>
                        <input
                          type="checkbox"
                          checked={isShared}
                          onChange={handleToggleShared}
                          className={style.toggleInput}
                        />
                        <span className={style.toggleSlider}></span>
                      </div>
                    </label>
                  </div>
                  <button
                    className={style.menuItem}
                    onClick={handleEditSession}
                  >
                    <FaEdit />
                    <span>Edit session</span>
                  </button>
                  <button
                    className={`${style.menuItem} ${style.deleteItem}`}
                    onClick={handleDeleteSession}
                  >
                    <MdDelete />
                    <span>Delete session</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Session Header */}
          <div className={style.sessionHeader}>
            <div className={style.sessionInfo}>
              <h2 className={style.spotName}>{forecast?.spotName}</h2>
              <div className={style.sessionMeta}>
                <span className={style.location}>{forecast?.region}</span>
              </div>
            </div>
          </div>

          {/* Session Content */}
          <div className={style.sessionContent}>
            {/* Session Image */}
            {session.image && (
              <div className={style.sessionImage}>
                <img src={session.image} alt="Session" />
              </div>
            )}

            {/* Forecast Accordion */}
            {forecast && (
              <div className={style.forecastAccordion}>
                <button
                  className={style.forecastHeader}
                  onClick={() => setIsForecastOpen(!isForecastOpen)}
                >
                  <div className={style.forecastHeaderContent}>
                    <img src={radarSVG} alt="" className={style.iconFilter} />
                    <span className={style.forecastSummary}>
                      {getForecastSummary()}
                    </span>
                    <div className={`${style.ratingBadge} ${ratingClass}`}>
                      {forecast.ratingDescription || "UNKNOWN"}
                    </div>
                  </div>
                  <FaChevronDown
                    className={`${style.accordionIcon} ${
                      isForecastOpen ? style.accordionIconOpen : ""
                    }`}
                  />
                </button>

                {isForecastOpen && (
                  <div className={style.forecastContent}>
                    <ForecastDisplay
                      forecast={transformForecastToReport(session.forecast!)}
                      addHeader={false}
                    />

                    <h4 className={style.forecastMatchTitle}>
                      Did Waves match Forecast?
                    </h4>
                    <p className={style.notesForecast}>
                      {session.sessionMatchForecast ||
                        "No notes about wave match"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Board Info */}
            {board && (
              <div className={style.boardDisplay}>
                <img
                  src={surfBoardSessionSVG}
                  alt=""
                  className={style.iconFilter}
                />
                <span className={style.boardDetails}>
                  {board.brand} • {board.name} • {board.size} • {board.volume}L
                </span>
              </div>
            )}

            {/* Session Duration */}
            <div className={style.boardDisplay}>
              <img src={watchIcon} alt="" className={style.iconFilter} />
              <span className={style.sessionDuration}>{sessionDuration}</span>
            </div>

            {/* Session Rating */}
            <div className={style.boardDisplay}>
              <div className={style.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`${style.star} ${
                      star <= getRatingNumber(session.rating)
                        ? style.starFilled
                        : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Session Notes */}
            <div className={style.sessionNotes}>
              <div className={style.notesSection}>
                <p className={style.notesText}>
                  {session.description || "No session notes"}
                </p>
              </div>
            </div>
          </div>

          <div className={style.sessionMeta}>
            <span className={style.date}>{formatDate(session.startTime)}</span>
          </div>
        </>
      )}
    </div>
  );
}
