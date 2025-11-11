import prisma from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

interface SwellData {
  swell: string;
  height: string;
  period: string;
  power: string;
  direction: string;
}

interface ForecastData {
  spotName: string;
  region: string;
  description: string;
  rating: {
    description: string;
    value: number;
  };
  size: string;
  waveEnergy: string;
  sessionStart: string; // "2025-11-11 09:00"
  tide: {
    height: string;
    type: string;
  };
  wind: {
    direction: string;
    speed: string;
    gust: string;
  };
  swells: SwellData[];
  surflineSpotId?: string;
}

async function addForecastToPrisma(
  forecastData: ForecastData,
  tx?: Prisma.TransactionClient
) {
  const prismaClient = tx || prisma;

  try {
    // Parse the sessionStart string to a Date object
    // Add "T" to make it ISO 8601 compliant
    const sessionStartISO = forecastData.sessionStart.replace(" ", "T") + ":00";
    const sessionDate = new Date(sessionStartISO);

    // Create the forecast with nested swells
    return await prismaClient.forecast.create({
      data: {
        spotName: forecastData.spotName,
        region: forecastData.region,
        surflineSpotId: forecastData.surflineSpotId,
        description: forecastData.description,
        size: forecastData.size,
        waveEnergy: forecastData.waveEnergy,
        date: sessionDate,
        tideHeight: forecastData.tide?.height,
        tideType: forecastData.tide?.type,
        windDirection: forecastData.wind?.direction,
        windSpeed: forecastData.wind?.speed,
        windGust: forecastData.wind?.gust,
        swells: {
          create: forecastData.swells.map((swell) => ({
            name: swell.swell,
            height: swell.height,
            period: swell.period,
            power: swell.power,
            direction: swell.direction,
          })),
        },
      },
      include: {
        swells: true,
      },
    });
  } catch (error) {
    console.error("Error adding forecast to Prisma:", error);
    throw error;
  }
}

export default addForecastToPrisma;
