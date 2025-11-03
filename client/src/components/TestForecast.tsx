import { APIURL } from "./APIUrl";

function TestForecast() {
  const clickHandler = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      const res = await fetch(`${APIURL}/forecast`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        console.log(data.forecast);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={(e) => clickHandler(e)}>Test Forecast</button>
    </div>
  );
}

export default TestForecast;
