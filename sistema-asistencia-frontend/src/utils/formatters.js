import { format, parseISO, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "-";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    return "-";
  }
};

export const formatDateAsNumber = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatDateTime = (date) => {
  return formatDate(date, "dd/MM/yyyy HH:mm");
};

export const formatTime = (date) => {
  return formatDate(date, "HH:mm");
};

export const formatRelativeTime = (date) => {
  if (!date) return "-";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: es,
    });
  } catch (error) {
    return "-";
  }
};

export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return "-";
  return new Intl.NumberFormat("es-DO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${formatNumber(percentage, 1)}%`;
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getNombreCompleto = (persona) => {
  if (!persona) return "-";
  const { nombre, nombre2, apellido, apellido2 } = persona;
  return [nombre, nombre2, apellido, apellido2]
    .filter(Boolean)
    .join(" ")
    .trim();
};
