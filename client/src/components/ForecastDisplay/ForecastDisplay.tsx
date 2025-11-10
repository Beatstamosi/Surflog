// ForecastDisplay.tsx
import { useState } from "react";
import type { Forecast } from "../types/models";
import style from "./ForecastDisplay.module.css";

interface ForecastDisplayProps {
  forecast: Forecast;
}

export default function ForecastDisplay({ forecast }: ForecastDisplayProps) {
  const [isSwellsOpen, setIsSwellsOpen] = useState(false);

  // Filter out empty swells
  const activeSwells =
    forecast.swells?.filter(
      (swell) => parseFloat(swell.height?.split(":")[1] || "0") > 0
    ) || [];

  // Use official Surfline rating
  const getRatingClass = (ratingValue: number) => {
    // Round to nearest 0.5 to handle float values
    const roundedRating = Math.round(ratingValue * 2) / 2;

    switch (roundedRating) {
      case 0.5:
      case 1:
        return style.ratingPoor;
      case 1.5:
      case 2:
      case 2.5:
      case 3:
        return style.ratingFair;
      case 3.5:
      case 4:
      case 4.5:
      case 5:
        return style.ratingGood;
      default:
        // Handle out-of-bounds values
        if (ratingValue < 1) return style.ratingPoor;
        if (ratingValue > 5) return style.ratingExcellent;
        return style.ratingPoor;
    }
  };

  const ratingClass = getRatingClass(forecast.rating?.value || 1);

  return (
    <div className={style.forecastContainer}>
      {/* Main Header with Rating */}
      <div className={style.header}>
        <div className={style.spotInfo}>
          <h1 className={style.spotName}>{forecast.spotName}</h1>
          <div className={style.region}>{forecast.region}</div>
        </div>
        <div className={`${style.ratingBadge} ${ratingClass}`}>
          {forecast.rating?.description || "UNKNOWN"}
        </div>
      </div>

      {/* Primary Conditions Grid */}
      <div className={style.primaryGrid}>
        {/* Wave Size - Main Card */}
        <div className={style.waveCard}>
          <div className={style.cardHeader}>
            <h3 className={style.cardTitle}>SURF</h3>
          </div>
          <div className={style.waveContent}>
            <div className={style.waveHeight}>
              {forecast.size?.replace("Surf: ", "")}
            </div>
            <div className={style.waveDescription}>{forecast.description}</div>
          </div>
        </div>

        {/* Conditions Row */}
        <div className={style.conditionsRow}>
          <div className={style.conditionItem}>
            <div className={style.conditionIcon}>🌊</div>
            <div className={style.conditionData}>
              <div className={style.conditionValue}>{forecast.waveEnergy}</div>
              <div className={style.conditionLabel}>Energy</div>
            </div>
          </div>

          <div className={style.conditionItem}>
            <div className={style.conditionIcon}>🌡️</div>
            <div className={style.conditionData}>
              <div className={style.conditionValue}>
                {forecast.tide?.height}
              </div>
              <div className={style.conditionLabel}>
                Tide • {forecast.tide?.type}
              </div>
            </div>
          </div>

          <div className={style.conditionItem}>
            <div className={style.conditionIcon}>💨</div>
            <div className={style.conditionData}>
              <div className={style.conditionValue}>{forecast.wind?.speed}</div>
              <div className={style.conditionLabel}>
                {forecast.wind?.direction}
                {forecast.wind?.gust && ` • G${forecast.wind.gust}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swells Accordion */}
      {activeSwells.length > 0 && (
        <div className={style.swellsSection}>
          <button
            className={style.accordionHeader}
            onClick={(e) => {
              e.preventDefault();
              setIsSwellsOpen(!isSwellsOpen);
            }}
            aria-expanded={isSwellsOpen}
          >
            <div className={style.accordionTitle}>
              <h3 className={style.sectionTitle}>SWELLS</h3>
              <span className={style.swellCount}>
                {activeSwells.length} swell
                {activeSwells.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div
              className={`${style.accordionIcon} ${
                isSwellsOpen ? style.accordionIconOpen : ""
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          <div
            className={`${style.accordionContent} ${
              isSwellsOpen ? style.accordionContentOpen : ""
            }`}
          >
            <div className={style.swellsGrid}>
              {activeSwells.map((swell, index) => (
                <div key={index} className={style.swellCard}>
                  <div className={style.swellHeader}>
                    <span>{swell.name || `Swell ${index + 1}`}</span>
                  </div>
                  <div className={style.swellDetails}>
                    <div className={style.swellRow}>
                      <span className={style.swellLabel}>Height</span>
                      <span className={style.swellValue}>
                        {parseFloat(swell.height?.split(":")[1] || "0").toFixed(
                          1
                        )}
                        m
                      </span>
                    </div>
                    <div className={style.swellRow}>
                      <span className={style.swellLabel}>Period</span>
                      <span className={style.swellValue}>
                        {swell.period?.split(":")[1]?.trim()}
                      </span>
                    </div>
                    <div className={style.swellRow}>
                      <span className={style.swellLabel}>Direction</span>
                      <span className={style.swellValue}>
                        {parseFloat(
                          swell.direction?.split(":")[1] || "0"
                        ).toFixed(0)}
                        °
                      </span>
                    </div>
                    <div className={style.swellRow}>
                      <span className={style.swellLabel}>Power</span>
                      <span className={style.swellValue}>
                        {swell.power?.split(":")[1]?.trim()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
