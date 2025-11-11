import { useEffect, useState } from "react";
import type { Forecast, Board } from "../types/models";
import { apiClient } from "../../utils/apiClient";
import style from "./AddSession.module.css";
import ForecastDisplay from "../ForecastDisplay/ForecastDisplay";
import { useNavigate } from "react-router-dom";

// TODO: Add session API endpoint - submit session
// allow image upload for session

export default function AddSession() {
  const [spotName, setSpotName] = useState("");
  const [startTimeSession, setStartTimeSession] = useState("");
  const [forecast, setForecast] = useState<Forecast | null>();
  const [boards, setBoards] = useState<Board[] | null>();
  const [shareInFeed, setShareInFeed] = useState(false);
  const [sessionAddedConfirmation, setSessionAddedConfirmation] =
    useState(false);
  const navigate = useNavigate();

  // No need for boards if there is no forecast
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await apiClient("/boards/user");
        setBoards(data.boards);
      } catch (err) {
        console.error("Error fetching boards: ", err);
      }
    };
    if (forecast) {
      fetchBoards();
    }
  }, [forecast]);

  const handlerGetForecast = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      const params = new URLSearchParams({
        spotName,
        startTimeSession,
      });
      const data = await apiClient(`/forecast?${params.toString()}`);
      setForecast(data.report);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    }
  };

  const handlerSaveSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const sessionMatchForecast = formData.get("sessionMatchForecasts");
    const description = formData.get("sessionNotes");
    const boardId = formData.get("chooseBoard");

    try {
      await apiClient("/session/user", {
        method: "POST",
        body: JSON.stringify({
          spotName,
          startTimeSession,
          forecast,
          shareInFeed,
          sessionMatchForecast,
          description,
          boardId,
        }),
      });
      showConfirmation();
    } catch (err) {
      console.error("Error adding session: ", err);
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
    setStartTimeSession("");
    setShareInFeed(false);
  };

  if (sessionAddedConfirmation) {
    return (
      <div className={style.sessionAdded}>
        <p>🤙</p>
        <p>Session added successfully!</p>
      </div>
    );
  }

  if (!forecast) {
    return (
      <>
        <div className={style.header}>
          <h1 className={style.title}>Start New Session</h1>
          <p className={style.subtitle}>Get the forecast and log your surf</p>
        </div>

        <form className={style.formAddSession}>
          <div className={style.inputGroup}>
            <label htmlFor="spotName" className={style.label}>
              Spot Name
            </label>
            <input
              type="text"
              placeholder="e.g. Trestles, Pipeline, Jeffreys Bay"
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              className={style.input}
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="startTimeSession" className={style.label}>
              What time did you start your session?
            </label>
            <select
              name="startTimeSession"
              id="startTimeSession"
              value={startTimeSession}
              onChange={(e) => setStartTimeSession(e.target.value)}
              className={style.select}
            >
              <option value="">-- Select Start of your session --</option>
              <option value="06:00">06:00am</option>
              <option value="07:00">07:00am</option>
              <option value="08:00">08:00am</option>
              <option value="09:00">09:00am</option>
              <option value="10:00">10:00am</option>
              <option value="11:00">11:00am</option>
              <option value="12:00">12:00pm</option>
              <option value="13:00">01:00pm</option>
              <option value="14:00">02:00pm</option>
              <option value="15:00">03:00pm</option>
              <option value="16:00">04:00pm</option>
              <option value="17:00">05:00pm</option>
              <option value="18:00">06:00pm</option>
              <option value="19:00">07:00pm</option>
              <option value="20:00">08:00pm</option>
            </select>
          </div>

          <div className={style.buttonGroup}>
            <button
              onClick={handlerGetForecast}
              disabled={!spotName || !startTimeSession}
              className={style.primaryButton}
            >
              Get Forecast
            </button>
          </div>
        </form>
      </>
    );
  }

  if (forecast) {
    return (
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
          <ForecastDisplay forecast={forecast} />

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
    );
  }
}
