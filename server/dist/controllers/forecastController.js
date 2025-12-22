import { getSurfReport } from "../utils/getSurfReport.js";
import handleError from "../services/handleError.js";
import createSessionDateString from "../utils/createSessionDateString.js";
const getForeCast = async (req, res) => {
    const { spotName, startTimeSession } = req.query;
    try {
        if (!spotName || !startTimeSession)
            throw Error("Missing Spot or start time.");
        const sessionDate = new Date(startTimeSession);
        const sessionStart = createSessionDateString(sessionDate);
        const report = await getSurfReport(sessionStart, spotName);
        if (!report)
            throw new Error("Report could not be fetched.");
        res.status(201).json({ report });
    }
    catch (err) {
        handleError(err, res);
    }
};
export { getForeCast };
