import { useState, useEffect, useRef } from "react";
import type { Session } from "../../types/models";
import style from "./DisplayMySession.module.css";
import { FaEdit } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import surfBoardSessionSVG from "../../../assets/surfboard_session.svg";
import radarSVG from "../../../assets/radar.svg";
import EditSession from "../../EditSession/EditSession";
import getRatingClass from "../../../utils/getRatingClass";

interface DisplaySessionProps {
  session: Session;
}

// TODO:
// edit functionality
// delete functionality
// share functionality

export default function DisplaySession({ session }: DisplaySessionProps) {
  const [isShared, setIsShared] = useState(session.shared);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editSession, setEditSession] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const forecast = session.forecast;
  const board = session.board;
  const ratingClass = style[getRatingClass(session.forecast?.ratingValue || 1)];

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

  return (
    <div className={style.sessionContainer}>
      {editSession ? (
        <EditSession session={session} setEditSession={setEditSession} />
      ) : (
        <>
          {/* 3-dot dropdown menu */}
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
                        onChange={(e) => setIsShared(e.target.checked)}
                        className={style.toggleInput}
                      />
                      <span className={style.toggleSlider}></span>
                    </div>
                  </label>
                </div>
                <button className={style.menuItem} onClick={handleEditSession}>
                  <FaEdit />
                  <span>Edit session</span>
                </button>
                <button className={`${style.menuItem} ${style.deleteItem}`}>
                  <MdDelete />
                  <span>Delete session</span>
                </button>
              </div>
            )}
          </div>

          {/* Session Header with 3-dot menu */}
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
                    {forecast.ratingDescription && (
                      <div className={`${style.ratingBadge} ${ratingClass}`}>
                        {forecast.ratingDescription || "UNKNOWN"}
                      </div>
                    )}

                    <div className={style.forecastGrid}>
                      <div className={style.forecastItem}>
                        <span className={style.forecastLabel}>Wave Height</span>
                        <span className={style.forecastValue}>
                          {getWaveHeight(forecast.size)}m
                        </span>
                      </div>
                      <div className={style.forecastItem}>
                        <span className={style.forecastLabel}>Conditions</span>
                        <span className={style.forecastValue}>
                          {forecast.description}
                        </span>
                      </div>
                      <div className={style.forecastItem}>
                        <span className={style.forecastLabel}>Wind</span>
                        <span className={style.forecastValue}>
                          {forecast.windSpeed} {forecast.windDirection}
                        </span>
                      </div>
                      <div className={style.forecastItem}>
                        <span className={style.forecastLabel}>Tide</span>
                        <span className={style.forecastValue}>
                          {forecast.tideHeight} {forecast.tideType}
                        </span>
                      </div>
                    </div>

                    {/* Swells Integrated */}
                    {forecast?.swells && forecast.swells.length > 0 && (
                      <div className={style.forecastGrid}>
                        {forecast.swells.slice(0, 2).map((swell, index) => (
                          <div key={index} className={style.swellItem}>
                            <span className={style.swellName}>
                              {swell.name}
                            </span>
                            <span className={style.swellDetails}>
                              {parseFloat(
                                swell.height?.split(":")[1] || "0"
                              ).toFixed(1)}
                              m • {swell.period?.split(":")[1]?.trim()} •{" "}
                              {parseFloat(
                                swell.direction?.split(":")[1] || "0"
                              ).toFixed(0)}
                              °
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

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
                  {board.brand} {board.name} • {board.size} • {board.volume}L
                </span>
              </div>
            )}

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
