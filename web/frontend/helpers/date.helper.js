const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;

export const isDate = (date) => {
  return !isNaN(new Date(date).getDate());
};

export const isValidYearMonthDayDateString = (date) => {
  return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
};

export const isValidDate = (date) => {
  return date.length === 10 && isValidYearMonthDayDateString(date);
};

export const parseYearMonthDayDateString = (input) => {
  const [year, month, day] = input.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

export const formatDateToYearMonthDayDateString = (date) => {
  const year = String(date.getFullYear());
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());
  if (month.length < 2) {
    month = String(month).padStart(2, "0");
  }
  if (day.length < 2) {
    day = String(day).padStart(2, "0");
  }
  return [year, month, day].join("-");
};

export const formatDate = (date) => {
  return formatDateToYearMonthDayDateString(date);
};

export const nodeContainsDescendant = (rootNode, descendant) => {
  if (rootNode === descendant) {
    return true;
  }
  let parent = descendant.parentNode;
  while (parent != null) {
    if (parent === rootNode) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
};

export const renderActiveContent = (active) => {
  const {
    title,
    alias,
    period: { since, until },
  } = active;
  let content;
  const sinceDate = new Date(since);
  const untilDate = new Date(until);

  switch (alias) {
    case "today":
      content = `${title} - ${sinceDate.toDateString()}`;
      break;
    case "yesterday":
      content = `${title} - ${sinceDate.toDateString()}`;
      break;
    default:
      content = `${sinceDate.toDateString()} - ${untilDate.toDateString()}`;
      break;
  }

  return content;
};

export const getDatePickerOption = () => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const last24hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0),
  );
  const todayIndex = today.getDay();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const firstDayOfWeek = new Date(
    new Date().setDate(today.getDate() - todayIndex + (todayIndex == 0 ? -6 : 1)),
  );
  const firstDayOfLastWeek = new Date(
    firstDayOfWeek.getFullYear(),
    firstDayOfWeek.getMonth(),
    firstDayOfWeek.getDate() - 7,
  );

  return [
    {
      title: "Today",
      alias: "today",
      period: {
        since: today,
        until: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    {
      title: "Last 24 hours",
      alias: "last24hours",
      period: {
        since: last24hours,
        until: new Date(),
      },
    },
    {
      title: "Last 3 days",
      alias: "last3days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 3)).setHours(0, 0, 0, 0)),
        until: yesterday,
      },
    },
    {
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)),
        until: yesterday,
      },
    },
    {
      title: "Last 30 days",
      alias: "last30days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 30)).setHours(0, 0, 0, 0)),
        until: yesterday,
      },
    },
    {
      title: "This week",
      alias: "thisweek",
      period: {
        since: new Date(firstDayOfWeek.setHours(0, 0, 0, 0)),
        until: today,
      },
    },
    {
      title: "Last week",
      alias: "lastweek",
      period: {
        since: new Date(firstDayOfLastWeek.setHours(0, 0, 0, 0)),
        until: new Date(
          new Date(firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 1)).setHours(0, 0, 0, 0),
        ),
      },
    },
    {
      title: "This month",
      alias: "thismonth",
      period: {
        since: new Date(firstDayOfMonth.setHours(0, 0, 0, 0)),
        until: today,
      },
    },
    {
      title: "Last month",
      alias: "lastmonth",
      period: {
        since: new Date(firstDayOfLastMonth.setHours(0, 0, 0, 0)),
        until: new Date(
          new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1)).setHours(0, 0, 0, 0),
        ),
      },
    },
    {
      title: "Custom",
      alias: "custom",
      period: {
        since: today,
        until: today,
      },
    },
  ];
};

export const getLast24Hours = () => {
  return new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
};

export const getToday = () => {
  return new Date(new Date().setHours(0, 0, 0, 0));
};

export const getYesterday = () => {
  const today = getToday();
  return new Date(new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0));
};

export const getFirstDayOfMonth = () => {
  const today = getToday();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

export const getFirstDayOfLastMonth = () => {
  return new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
};

export const getFirstDayOfWeek = () => {
  const today = getToday();
  const todayIndex = today.getDay();
  return new Date(new Date().setDate(today.getDate() - todayIndex + (todayIndex == 0 ? -6 : 1)));
};

export const getFirstDayOfLastWeek = () => {
  const firstDayOfWeek = getFirstDayOfWeek();
  return new Date(
    firstDayOfWeek.getFullYear(),
    firstDayOfWeek.getMonth(),
    firstDayOfWeek.getDate() - 7,
  );
};

export const getDate30DaysAgo = () => {
  const today = getToday();
  return new Date(today.setDate(today.getDate() - 30));
};
