export const formatValueWithUnit = (value) => {
  if (value >= 1000000) {
    return parseInt(value / 1000000) + "M";
  } else if (value >= 1000) {
    return parseInt(value / 1000) + "k";
  } else {
    return parseInt(value);
  }
};

export const formatUrlListingHM = (filter, queryValue) => {
  const queryParams = new URLSearchParams({
    page: filter.currentPage,
    query: queryValue,
    sort: filter.sortValue,
    device: filter.device,
    startDate: filter.startDate ? new Date(filter.startDate).toISOString() : "",
    endDate: filter.endDate ? new Date(filter.endDate).toISOString() : "",
    typeDate: filter?.typeDate,
  });
  return `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pages?${queryParams}`;
};

export const formatUrlRedirectHM = (filter) => {
  const sd = filter.startDate
    ? new Date(filter.startDate).toLocaleDateString().replaceAll("/", "-")
    : "";
  const ed = filter.endDate
    ? new Date(filter.endDate).toLocaleDateString().replaceAll("/", "-")
    : "";
  const dT = filter?.typeDate;
  if (dT === "custom") {
    return `device=${filter?.device}&sd=${sd}&ed=${ed}&dT=${dT}`;
  }

  return `device=${filter?.device}&dT=${dT}`;
};
