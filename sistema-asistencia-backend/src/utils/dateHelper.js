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
  // Convierte una hora ("08:15", "08:15:00", "8:15 am") a Date de hoy con esa hora
  const minutes = timeStringToMinutes(timeString);
  const date = new Date();
  if (minutes === null) return new Date(NaN);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  date.setHours(hours, mins, 0, 0);
  return date;
};

export const timeStringToMinutes = (timeValue) => {
  if (timeValue === null || timeValue === undefined) return null;

  const raw = String(timeValue).trim();
  if (!raw) return null;

  // Soporta: HH:MM, HH:MM:SS, H:MM am/pm
  const match = raw.match(
    /^(\d{1,2})(?::(\d{2}))(?::(\d{2}))?\s*(am|pm)?$/i
  );
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[4]?.toLowerCase();

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (meridiem) {
    // 12-hour
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "am") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  } else {
    // 24-hour
    if (hours < 0 || hours > 23) return null;
  }

  return hours * 60 + minutes;
};

export const isTimeInRange = (time, start, end) => {
  const timeMinutes = timeStringToMinutes(time);
  const startMinutes = timeStringToMinutes(start);
  const endMinutes = timeStringToMinutes(end);

  if (timeMinutes === null || startMinutes === null || endMinutes === null) {
    return false;
  }

  // Rango normal (ej: 08:15-11:00)
  if (startMinutes <= endMinutes) {
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  // Rango que cruza medianoche (ej: 22:00-02:00)
  return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
};

export const getCurrentTime = (options = {}) => {
  const timeZone = options.timeZone ?? process.env.APP_TIMEZONE;
  if (!timeZone) return formatTime(new Date());

  // Usar Intl para evitar depender del TZ del sistema/host
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  if (!hour || !minute) return formatTime(new Date());
  return `${hour}:${minute}`;
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
  timeStringToMinutes,
  isTimeInRange,
  getCurrentTime,
  addDays,
  getDayOfWeek,
};
