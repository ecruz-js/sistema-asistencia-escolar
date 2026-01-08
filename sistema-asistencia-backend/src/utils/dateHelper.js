export const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatDateTime = (date) => {
  if (!date) return null;
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const getTodayDate = () => {
  return formatDate(new Date());
};

export const isToday = (date) => {
  return formatDate(date) === getTodayDate();
};

export const parseTime = (timeString) => {
  // Convierte "08:15" a objeto Date de hoy con esa hora
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const isTimeInRange = (time, start, end) => {
  const timeDate = parseTime(time);
  const startDate = parseTime(start);
  const endDate = parseTime(end);
  return timeDate >= startDate && timeDate <= endDate;
};

export const getCurrentTime = () => {
  return formatTime(new Date());
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDayOfWeek = (date) => {
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  return days[new Date(date).getDay()];
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  getTodayDate,
  isToday,
  parseTime,
  isTimeInRange,
  getCurrentTime,
  addDays,
  getDayOfWeek,
};
