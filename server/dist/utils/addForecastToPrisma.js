import prisma from "../lib/prisma.js";
async function addForecastToPrisma(forecastData, tx) {
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
                ratingValue: forecastData.rating.value,
                ratingDescription: forecastData.rating.description,
                swells: {
                    create: forecastData.swells.map((swell) => ({
                        name: swell.name,
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
    }
    catch (error) {
        console.error("Error adding forecast to Prisma:", error);
        throw error;
    }
}
export default addForecastToPrisma;
