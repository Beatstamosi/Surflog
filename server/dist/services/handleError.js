function handleError(error, res) {
    if (error instanceof Error) {
        res.status(500).json({ error: error.message });
    }
    else {
        res.status(500).json({ error: "Unknown Error occurred" });
    }
}
export default handleError;
