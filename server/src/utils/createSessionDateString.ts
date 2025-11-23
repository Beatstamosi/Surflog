export default function createSessionDateString(startTimeSession: Date) {
  if (!startTimeSession) {
    return null;
  }

  // Format the date from the TimePicker
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = startTimeSession.getFullYear();
  const month = pad(startTimeSession.getMonth() + 1);
  const day = pad(startTimeSession.getDate());
  const hours = pad(startTimeSession.getHours());
  const minutes = pad(startTimeSession.getMinutes());

  // Construct the final string: "YYYY-MM-DD HH:MM"
  const sessionStartString = `${year}-${month}-${day} ${hours}:${minutes}`;

  return sessionStartString;
}
