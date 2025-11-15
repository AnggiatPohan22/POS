// backend/config/timeConfig.js

export const TIME_ZONE = "Asia/Makassar"; // WITA (Bali & Surrounding Region)
export const TIME_LOCALE = "id-ID";

export const formatTime = (date = new Date()) => {
  return new Date(date).toLocaleString(TIME_LOCALE, {
    timeZone: TIME_ZONE,
    hour12: false
  });
};
