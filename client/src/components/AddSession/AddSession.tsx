import { useEffect, useState } from "react";
import type { ForecastReport, Board } from "../types/models";
import { apiClient } from "../../utils/apiClient";
import style from "./AddSession.module.css";
import ForecastDisplay from "../ForecastDisplay/ForecastDisplay";
import { useNavigate } from "react-router-dom";
import uploadImageToSupaBase from "../../utils/uploadImageToSupaBase";
import { useAuth } from "../Authentication/useAuth";
import { TimePicker } from "@mui/x-date-pickers";
import type { PickerValue } from "@mui/x-date-pickers/internals";
import { getRatingNumber, handleRatingClick } from "../../utils/ratingHelpers";
import ErrorPopup from "../ErrorPopUp/ErrorPopUp";
import { useErrorPopup } from "../ErrorPopUp/useErrorPopUp";

export default function AddSession() {
  const [spotName, setSpotName] = useState("");
  const [startTimeSession, setStartTimeSession] = useState<PickerValue | null>(
    null
  );
  const [endTimeSession, setEndTimeSession] = useState<PickerValue | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastReport | null>();
  const [boards, setBoards] = useState<Board[] | null>();
  const [shareInFeed, setShareInFeed] = useState(false);
  const [sessionAddedConfirmation, setSessionAddedConfirmation] =
    useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionRating, setSessionRating] = useState<
    "ZERO" | "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE"
  >("ZERO");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fetchingForecast, setFetchingForecast] = useState(false);

  // Use the error popup hook
  const { showError, closeError, error, isErrorVisible } = useErrorPopup();

  // No need for boards if there is no forecast
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await apiClient("/boards/user");
        setBoards(data.boards);
      } catch (err) {
        console.error("Error fetching boards: ", err);
        showError("Failed to load your boards. Please try again.");
      }
    };
    if (forecast) {
      fetchBoards();
    }
  }, [forecast, showError]);

  useEffect(() => {
    if (forecast) setFetchingForecast(false);
  }, [forecast]);

  const handlerGetForecast = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setFetchingForecast(true);

    try {
      const params = new URLSearchParams({
        spotName,
        startTimeSession: startTimeSession?.toISOString() || "",
      });
      const data = await apiClient(`/forecast?${params.toString()}`);
      setForecast(data.report);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setForecast(null);
      setFetchingForecast(false);
      showError(
        "Failed to fetch forecast for this spot and time. Please check the spot name and try again."
      );
    }
  };

  const handlerSaveSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let imageUrl;
      const formData = new FormData(e.currentTarget);
      const formValues = {
        sessionMatchForecast: formData.get("sessionMatchForecast") as string,
        description: formData.get("sessionNotes") as string,
        boardId: parseInt(formData.get("chooseBoard") as string, 10),
        sessionRating: sessionRating,
      };

      if (selectedFile) {
        imageUrl = await uploadImageToSupaBase(
          selectedFile,
          user?.id,
          "Session Images",
          forecast?.sessionStart
        );
      }

      await apiClient("/sessions", {
        method: "POST",
        body: JSON.stringify({
          forecast,
          shareInFeed,
          ...formValues,
          sessionImageUrl: imageUrl,
          startTimeSession,
          endTimeSession,
          sessionRating,
        }),
      });

      showConfirmation();
    } catch (err) {
      console.error("Error adding session: ", err);
      showError(
        "Failed to save your session. Please fill in all fields and try again."
      );
    }
  };

  const showConfirmation = () => {
    setSessionAddedConfirmation(true);

    setTimeout(() => {
      setSessionAddedConfirmation(false);
      navigate("/my-sessions");
    }, 1500);
  };

  const resetForm = () => {
    setForecast(null);
    setSpotName("");
    setStartTimeSession(null);
    setEndTimeSession(null);
    setShareInFeed(false);
    setSessionRating("ZERO");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (sessionAddedConfirmation) {
    return (
      <div className={style.sessionAdded}>
        <p>🤙</p>
        <p>Session added successfully!</p>
      </div>
    );
  }

  return (
    <>
      {/* Error Popup */}
      {isErrorVisible && error && (
        <ErrorPopup message={error} onClose={closeError} duration={5000} />
      )}

      {fetchingForecast ? (
        <div className={style.loadingContainer}>
          <div className={style.spinner}></div>
          <h2>Fetching your forecast...</h2>
          <p>We're grabbing the latest data.</p>
        </div>
      ) : !forecast ? (
        <>
          <div className={style.header}>
            <h1 className={style.title}>Start New Session</h1>
            <p className={style.subtitle}>Get the forecast and log your surf</p>
          </div>

          <form className={style.formAddSession}>
            <div className={style.inputGroup}>
              <label htmlFor="spotName" className={style.label}>
                Spot Name - only use spots that are on surfline
              </label>
              <input
                type="text"
                placeholder="e.g. Trestles, Pipeline, Jeffreys Bay"
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
                className={style.input}
              />
            </div>

            <div className={style.inputGroupTime}>
              <label htmlFor="startTimeSession" className={style.label}>
                What time did you start your session?
              </label>
              <TimePicker
                label={"Session Start"}
                closeOnSelect={true}
                name="startTimeSession"
                value={startTimeSession}
                onChange={(newValue) => setStartTimeSession(newValue)}
              />
            </div>

            <div className={style.inputGroupTime}>
              <label htmlFor="endTimeSession" className={style.label}>
                What time did you end your session?
              </label>
              <TimePicker
                label={"Session End"}
                closeOnSelect={true}
                name="endTimeSession"
                value={endTimeSession}
                onChange={(newValue) => setEndTimeSession(newValue)}
              />
            </div>

            <div className={style.buttonGroup}>
              <button
                onClick={handlerGetForecast}
                disabled={!spotName || !startTimeSession || !endTimeSession}
                className={style.primaryButton}
              >
                Get Forecast
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className={style.header}>
            <h1 className={style.title}>Log Your Session</h1>
            <p className={style.subtitle}>
              {forecast.spotName} • {forecast.region}
            </p>
            <button onClick={resetForm} className={style.backButton}>
              ← Change Spot
            </button>
          </div>

          <form onSubmit={handlerSaveSession} className={style.formAddSession}>
            <ForecastDisplay forecast={forecast} addHeader={true} />

            <div className={style.sessionDetails}>
              <div className={style.inputGroup}>
                <label htmlFor="sessionMatchForecast" className={style.label}>
                  Did the waves match the forecast?
                </label>
                <textarea
                  name="sessionMatchForecast"
                  id="sessionMatchForecast"
                  placeholder="e.g. Waves were 2ft bigger than forecast, more consistent than expected..."
                  className={style.textarea}
                  rows={3}
                />
              </div>

              <div className={style.inputGroup}>
                <label htmlFor="sessionNotes" className={style.label}>
                  Session Notes
                </label>
                <textarea
                  name="sessionNotes"
                  id="sessionNotes"
                  placeholder="Left was really fun. The Right a bit soft. Tried some cutbacks. Need to learn how to properly use my arms."
                  className={style.textarea}
                  rows={4}
                />
              </div>

              <div className={style.inputGroup}>
                <label htmlFor="chooseBoard" className={style.label}>
                  Which board did you surf?
                </label>
                <select
                  name="chooseBoard"
                  id="chooseBoard"
                  className={style.select}
                >
                  <option value="">-- Select board from your quiver --</option>
                  {boards?.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.brand} - {b.name} - {b.size} - {b.volume}L
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Rating */}
              <div className={style.inputGroup}>
                <label className={style.label}>Rate your session</label>
                <div className={style.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`${style.star} ${
                        star <= getRatingNumber(sessionRating)
                          ? style.starFilled
                          : ""
                      }`}
                      onClick={() => handleRatingClick(star, setSessionRating)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className={style.inputGroup}>
                <label htmlFor="sessionUpload">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  id="sessionUpload"
                  onChange={handleFileChange}
                />
              </div>

              <div className={style.toggleGroup}>
                <div className={style.toggleItem}>
                  <label htmlFor="connectWatch" className={style.toggleLabel}>
                    <span>Connect with Surf Watch</span>
                    <div className={style.toggleContainer}>
                      <input
                        type="checkbox"
                        id="connectWatch"
                        disabled={true}
                        className={style.toggleInput}
                      />
                      <span className={style.toggleSlider}></span>
                    </div>
                  </label>
                  <span className={style.italicInfo}>
                    Functionality not available in beta.
                  </span>
                </div>

                <div className={style.toggleItem}>
                  <label htmlFor="share" className={style.toggleLabel}>
                    <span>Share in Feed</span>
                    <div className={style.toggleContainer}>
                      <input
                        type="checkbox"
                        id="share"
                        checked={shareInFeed}
                        onChange={(e) => setShareInFeed(e.target.checked)}
                        className={style.toggleInput}
                      />
                      <span className={style.toggleSlider}></span>
                    </div>
                  </label>
                </div>
              </div>

              <div className={style.buttonGroup}>
                <button type="submit" className={style.primaryButton}>
                  Save Session
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );
}
