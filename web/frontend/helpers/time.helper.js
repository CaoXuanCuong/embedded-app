export function getInactiveTime(lastActiveDate) {
  const now = new Date();
  const last = new Date(lastActiveDate);

  let diff = (now - last) / 1000;
  if (diff < 60) {
    diff = `${Math.floor(diff)}s ago`;
  } else {
    diff = diff / 60;
    if (diff < 60) {
      diff = `${Math.floor(diff)}m ago`;
    } else {
      diff = diff / 60;
      if (diff < 24) {
        diff = `${Math.floor(diff)}h ago`;
      } else {
        diff = diff / 24;
        if (diff < 30) {
          diff = `${Math.floor(diff)}d ago`;
        } else {
          diff = diff / 30;
          if (diff < 12) {
            diff = `${Math.floor(diff)}mon ago`;
          } else {
            diff = diff / 12;
            diff = `${Math.floor(diff)}y ago`;
          }
        }
      }
    }
  }
  return diff;
}

export function getDaysArray(start, end) {
  for (var arr = [], dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
}

export function getCurrentMonthDayArray() {
  const curr = new Date();
  const prev = new Date(new Date().setDate(curr.getDate() - 30));
  return getDaysArray(prev, curr);
}

export function dateTimeFormat(date) {
  const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    hc: "h12",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return dateTimeFormat.format(date);
}

export function convertDurationToMmSs(duration) {
  return `${
    Math.floor(Math.round(duration) / 60) < 10
      ? "0" + Math.floor(Math.round(duration) / 60)
      : Math.floor(Math.round(duration) / 60)
  } : ${
    Math.floor(Math.round(duration) % 60) < 10
      ? "0" + Math.floor(Math.round(duration) % 60)
      : Math.floor(Math.round(duration) % 60)
  }`;
}

export function calcDaysBetween2Dates(start, end) {
  let difference = new Date(end).getTime() - new Date(start).getTime();
  let totalDays = Math.floor(difference / (1000 * 3600 * 24));
  return totalDays;
}

export function padZero(number) {
  return number.toString().padStart(2, "0");
}

export function formatTime(date) {
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return `${hours}:${minutes}:${seconds}`;
}

export const formatDateLocale = (str) => {
  if (!str) return;
  const date = new Date(str);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${formatTime(
    date,
  )}`;
};
