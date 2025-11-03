import { apiClient } from "../utils/apiClient";

function TestForecast() {
  const clickHandler = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      const data = await apiClient("/forecast", { auth: false });
      console.log(data.report);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    }
  };

  return (
    <div>
      <button onClick={(e) => clickHandler(e)}>Test Forecast</button>
    </div>
  );
}

export default TestForecast;
