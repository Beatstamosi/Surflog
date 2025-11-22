import type { ForecastReport } from "../types/models";
import getRatingClass from "../../utils/getRatingClass";
import style from "./ForecastDisplay.module.css";

interface ForecastDisplayProps {
  forecast: ForecastReport;
}

export default function ForecastDisplay({ forecast }: ForecastDisplayProps) {
  const ratingClass = style[getRatingClass(forecast.rating?.value || 1)];

  // Extract wave height from size string
  const getWaveHeight = (size: string) => {
    return size?.replace("Surf: ", "") || "N/A";
  };

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

      <div className={style.forecastGrid}>
        <div className={style.forecastItem}>
          <span className={style.forecastLabel}>Wave Height</span>
          <span className={style.forecastValue}>
            {getWaveHeight(forecast.size)}m
          </span>
        </div>
        <div className={style.forecastItem}>
          <span className={style.forecastLabel}>Conditions</span>
          <span className={style.forecastValue}>{forecast.description}</span>
        </div>
        <div className={style.forecastItem}>
          <span className={style.forecastLabel}>Wind</span>
          <span className={style.forecastValue}>
            {forecast.wind?.speed} {forecast.wind?.direction}
          </span>
        </div>
        <div className={style.forecastItem}>
          <span className={style.forecastLabel}>Tide</span>
          <span className={style.forecastValue}>
            {forecast.tide?.height} {forecast.tide?.type}
          </span>
        </div>
      </div>

      {/* Swells Integrated */}
      {forecast?.swells && forecast.swells.length > 0 && (
        <div className={style.forecastGrid}>
          {forecast.swells.slice(0, 2).map((swell, index) => (
            <div key={index} className={style.swellItem}>
              <span className={style.swellName}>{swell.name}</span>
              <span className={style.swellDetails}>
                {parseFloat(swell.height?.split(":")[1] || "0").toFixed(1)}m •{" "}
                {swell.period?.split(":")[1]?.trim()} •{" "}
                {parseFloat(swell.direction?.split(":")[1] || "0").toFixed(0)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
