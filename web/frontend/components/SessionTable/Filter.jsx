import {
  TextField,
  IndexFilters,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  ChoiceList,
  Icon,
} from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COUNTRIES, SAMPLECOUNTRIES } from "helpers/country.helper";
import { isBasic } from "helpers/plan.helper";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFilterSelected,
  setFilterMode,
  setFilterSelected,
} from "redux/reducers/sessions.reducer";
import { selectShop } from "redux/reducers/general.reducer";

import { DurationOptions, EventOptions, PagePerSessionOptions } from "consts/Filters.const";
const DEFAULT_FILTER = {
  browser: [],
  device: [],
  duration: [],
  event: [],
  exit_page: [],
  location: [],
  operating_system: [],
  page_per_session: [],
  visited_page: [],
};

export default function SessionFilter({
  jwt,
  filter,
  dispatch,
  setToastMessage,
  setToastActive,
  currentPlan,
  tableLoading,
}) {
  const { appPlanCode } = useSelector(selectShop);
  const dispatchSession = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sampleFilter, setSampleFilter] = useState([]);
  const [countryValue, setCountryValue] = useState("");
  const [visitedValue, setVisitedValue] = useState("");
  const [exitValue, setExitValue] = useState("");
  const [urlPageSample, setUrlPageSample] = useState([]);
  const [urlExitPageSample, setExitUrlPageSample] = useState([]);
  const [itemStrings, setItemStrings] = useState(["All"]);
  const [disableFilter, setDisableFilter] = useState(true);
  const [filterButtonTooltip, setFilterButtonTooltip] = useState("Filter session");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const selectedFilter = useSelector(selectFilterSelected);
  const appliedFilters = [];
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default);
  const onHandleCancel = () => {
    if (selectedFilter === 0) {
      dispatch({ type: "all", payload: DEFAULT_FILTER });
    } else {
      dispatch({
        type: "all",
        payload: sampleFilter[selectedFilter - 1]
          ? sampleFilter[selectedFilter - 1].data
          : DEFAULT_FILTER,
      });
    }
  };

  useEffect(() => {
    dispatchSession(setFilterMode(mode));
  }, [mode]);

  const countries = useMemo(
    () =>
      SAMPLECOUNTRIES.filter((country) =>
        country.label.toLowerCase().includes(countryValue.toLowerCase()),
      ),
    [countryValue],
  );
  const urls_visited = useMemo(
    () =>
      urlPageSample
        .filter((url) => {
          return url.label.toLowerCase().includes(visitedValue.toLowerCase());
        })
        .map((urlObject) => {
          return {
            label: (
              <span className="label-options-custom">
                <span>
                  {urlObject.label.length > 23
                    ? urlObject.label.slice(0, 23) + "..."
                    : urlObject.label}
                </span>
                <span className="label-number-right">{urlObject.count}</span>
              </span>
            ),
            value: urlObject.value,
          };
        }),
    [visitedValue, urlPageSample],
  );
  const urls_exit = useMemo(
    () =>
      urlExitPageSample
        .filter((url) => {
          return url.label.toLowerCase().includes(exitValue.toLowerCase());
        })
        .map((urlObject) => {
          return {
            label: (
              <span className="label-options-custom">
                <span>
                  {urlObject.label.length > 23
                    ? urlObject.label.slice(0, 23) + "..."
                    : urlObject.label}
                </span>
                <span className="label-number-right">{urlObject.count}</span>
              </span>
            ),
            value: urlObject.value,
          };
        }),
    [exitValue, urlExitPageSample],
  );
  const onCreateNewView = async (value) => {
    setLoading(true);
    try {
      const result = await onHandleSave(null, value, filter);
      if (result) {
        await fetchFilter();
        dispatchSession(setFilterSelected(sampleFilter.length + 1));
        setToastMessage('Create new view "' + value + '" successfully.');
        setToastActive(true);
      } else {
        setToastMessage('Cannot create view "' + value + '".');
        setToastActive(true);
      }
    } catch (e) {
      setToastMessage(e);
      setToastActive(true);
    }
    setLoading(false);
    return true;
  };

  const onSaveView = async () => {
    setLoading(true);
    try {
      const result = await onHandleSave(
        sampleFilter[selectedFilter - 1]._id,
        sampleFilter[selectedFilter - 1].name,
        filter,
      );
      if (result) {
        let temp = sampleFilter;
        temp[selectedFilter - 1] = { ...sampleFilter[selectedFilter - 1], data: filter };
        setSampleFilter(temp);
        setToastMessage("Save view successfully.");
        setToastActive(true);
      } else {
        setToastMessage("Save view failed.");
        setToastActive(true);
      }
    } catch (e) {
      setToastMessage(e);
      setToastActive(true);
    }
    setLoading(false);
    return true;
  };

  const compareFilter = (first, second) => {
    return JSON.stringify(first) === JSON.stringify(second);
  };

  const primaryAction =
    selectedFilter === 0
      ? {
          type: "save-as",
          onAction: onCreateNewView,
          disabled:
            Object.entries(DEFAULT_FILTER).sort().toString() ===
            Object.entries(filter).sort().toString(),
          loading: loading,
        }
      : {
          type: "save",
          onAction: onSaveView,
          disabled: compareFilter(filter, sampleFilter[selectedFilter - 1]?.data),
          loading: loading,
        };

  const handleEventByChange = (value) => dispatch({ type: "event", payload: value });
  const handleDurationChange = (value) => dispatch({ type: "duration", payload: value });
  const handleVisitedPageChange = (value) => dispatch({ type: "visited_page", payload: value });
  const handleExitPageChange = (value) => dispatch({ type: "exit_page", payload: value });
  const handleDeviceChange = (value) => dispatch({ type: "device", payload: value });
  const handleBrowserChange = (value) => dispatch({ type: "browser", payload: value });
  const handleOSChange = (value) => dispatch({ type: "operating_system", payload: value });
  const handleLocationChange = (value) => dispatch({ type: "location", payload: value });
  const handlePagePerSessionChange = (value) =>
    dispatch({ type: "page_per_session", payload: value });

  const handleEventByRemove = () => dispatch({ type: "event", payload: [] });
  const handleDurationRemove = () => dispatch({ type: "duration", payload: [] });
  const handleVisitedPageRemove = () => dispatch({ type: "visited_page", payload: [] });
  const handleExitPageRemove = () => dispatch({ type: "exit_page", payload: [] });
  const handleDeviceRemove = () => dispatch({ type: "device", payload: [] });
  const handleBrowserRemove = () => dispatch({ type: "browser", payload: [] });
  const handleOSRemove = () => dispatch({ type: "operating_system", payload: [] });
  const handleLocationRemove = () => dispatch({ type: "location", payload: [] });
  const handlePagePerSessionRemove = () => dispatch({ type: "page_per_session", payload: [] });
  const handleFiltersClearAll = () => dispatch({ type: "all", payload: DEFAULT_FILTER });

  const handleChangeValueCountry = useCallback((value) => {
    setCountryValue(value);
  }, []);
  const handleClearValueCountry = useCallback(() => {
    setCountryValue("");
  }, []);

  const handleChangeVisitedPageText = useCallback((value) => {
    setVisitedValue(value);
  }, []);
  const handleClearVisitedPageText = useCallback(() => {
    setVisitedValue("");
  }, []);
  const handleChangeExitPageText = useCallback((value) => {
    setExitValue(value);
  }, []);
  const handleClearExitPageText = useCallback(() => {
    setExitValue("");
  }, []);

  const filters = [
    {
      key: "event",
      label: "Event",
      filter: (
        <ChoiceList
          title="Event "
          titleHidden
          choices={Object.keys(EventOptions).map((event) => {
            return { label: EventOptions[event], value: event };
          })}
          selected={filter.event || []}
          onChange={handleEventByChange}
          allowMultiple
        />
      ),
      shortcut: true,
      pinned: true,
    },
    {
      key: "visited_page",
      label: "Visited Page",
      filter: (
        <>
          <div style={{ position: "sticky", top: "12px", bottom: "10px", zIndex: 999 }}>
            <TextField
              prefix={<Icon source={SearchMinor} tone="base" />}
              value={visitedValue}
              onChange={handleChangeVisitedPageText}
              onClearButtonClick={handleClearVisitedPageText}
              clearButton={true}
              autoComplete="off"
            ></TextField>
          </div>
          <ChoiceList
            title="Visited Page"
            titleHidden
            choices={urls_visited}
            selected={filter.visited_page || []}
            onChange={handleVisitedPageChange}
            allowMultiple
          />
        </>
      ),
      shortcut: true,
      pinned: true,
    },
    {
      key: "duration",
      label: "Duration",
      filter: (
        <ChoiceList
          title="Duration"
          titleHidden
          choices={Object.keys(DurationOptions).map((range) => {
            return { label: DurationOptions[range], value: parseInt(range) };
          })}
          selected={filter.duration || []}
          onChange={handleDurationChange}
          allowMultiple
        />
      ),
      shortcut: true,
      pinned: true,
    },
    {
      key: "browser",
      label: "Browser",
      filter: (
        <ChoiceList
          title="Browser"
          titleHidden
          choices={[
            { label: "Chrome", value: "Chrome" },
            { label: "Edge", value: "Edge" },
            { label: "Safari", value: "Safari" },
            { label: "Opera", value: "Opera" },
            { label: "Firefox", value: "Firefox" },
            { label: "IE", value: "IE" },
            { label: "Unknown", value: "Unknown" },
          ]}
          selected={filter.browser || []}
          onChange={handleBrowserChange}
          allowMultiple
        />
      ),
      shortcut: false,
    },
    {
      key: "country",
      label: "Country",
      filter: (
        <div>
          <div style={{ position: "sticky", top: "12px", bottom: "10px", zIndex: 999 }}>
            <TextField
              prefix={<Icon source={SearchMinor} tone="base" />}
              value={countryValue}
              onChange={handleChangeValueCountry}
              onClearButtonClick={handleClearValueCountry}
              clearButton={true}
              autoComplete="off"
            ></TextField>
          </div>
          <ChoiceList
            title="Country"
            titleHidden
            choices={countries}
            selected={filter.location || []}
            onChange={handleLocationChange}
            allowMultiple
          />
        </div>
      ),
      shortcut: false,
    },
    {
      key: "device",
      label: "Device",
      filter: (
        <ChoiceList
          title="Device"
          titleHidden
          choices={[
            { label: "Desktop", value: "Desktop" },
            { label: "Tablet", value: "Tablet" },
            { label: "Mobile", value: "Mobile" },
            { label: "Unknown", value: "Unknown" },
          ]}
          selected={filter.device || []}
          onChange={handleDeviceChange}
          allowMultiple
        />
      ),
      shortcut: false,
    },
    {
      key: "exit_page",
      label: "Exit Page",
      filter: (
        <>
          <div style={{ position: "sticky", top: "12px", bottom: "10px", zIndex: 999 }}>
            <TextField
              prefix={<Icon source={SearchMinor} tone="base" />}
              value={exitValue}
              onChange={handleChangeExitPageText}
              onClearButtonClick={handleClearExitPageText}
              clearButton={true}
              autoComplete="off"
            ></TextField>
          </div>
          <ChoiceList
            title="Exit Page"
            titleHidden
            choices={urls_exit}
            selected={filter.exit_page || []}
            onChange={handleExitPageChange}
            allowMultiple
          />
        </>
      ),
      shortcut: false,
    },
    {
      key: "os",
      label: "OS",
      filter: (
        <ChoiceList
          title="Operating system"
          titleHidden
          choices={[
            { label: "Windows", value: "Windows" },
            { label: "Android", value: "Android" },
            { label: "iOS", value: "iOS" },
            { label: "Mac OS", value: "Mac OS" },
            { label: "Linux", value: "Linux" },
            { label: "Unknown", value: "Unknown" },
          ]}
          selected={filter.operating_system || []}
          onChange={handleOSChange}
          allowMultiple
        />
      ),
      shortcut: false,
    },
    {
      key: "page_per_session",
      label: "Page Per Session",
      filter: (
        <ChoiceList
          title="Page per session"
          titleHidden
          choices={Object.keys(PagePerSessionOptions).map((range) => {
            return { label: PagePerSessionOptions[range], value: parseInt(range) };
          })}
          selected={filter.page_per_session || []}
          onChange={handlePagePerSessionChange}
          allowMultiple
        />
      ),
      shortcut: false,
    },
  ];

  const deleteView = async (index) => {
    await deleteFilter(index);
  };

  const duplicateView = async (name, index) => {
    try {
      let result = await onHandleSave(
        null,
        name,
        sampleFilter[index - 1] ? sampleFilter[index - 1].data : DEFAULT_FILTER,
      );
      if (result) {
        await fetchFilter();
        dispatchSession(setFilterSelected(itemStrings.length));
        setToastMessage("Duplicate view successfully.");
        setToastActive(true);
      } else {
        setToastMessage("Duplicate faild.");
        setToastActive(true);
      }
    } catch (e) {
      console.log(e);
      setToastMessage(e);
      setToastActive(true);
    }
    return true;
  };
  const editView = (name) => {
    dispatchSession(setFilterSelected(itemStrings.indexOf(name)));
    setMode(IndexFiltersMode.Filtering);
  };

  const tabs = useMemo(
    () =>
      itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: false,
        actions:
          index === 0
            ? []
            : [
                {
                  type: "rename",
                  onPrimaryAction: async (value) => {
                    //Fetch save
                    let id = index === 0 ? null : sampleFilter[index - 1]._id;
                    try {
                      const result = await onHandleSave(id, value, filter);
                      if (result) {
                        const newItemsStrings = tabs.map((item, idx) => {
                          if (idx === index) {
                            return value;
                          }
                          return item.content;
                        });
                        setItemStrings(newItemsStrings);
                        setToastMessage("Rename view successfully.");
                        setToastActive(true);
                      } else {
                        setToastMessage("Fail to rename view.");
                        setToastActive(true);
                      }
                    } catch (e) {
                      setToastMessage(e);
                      setToastActive(true);
                    }
                    return true;
                  },
                },
                {
                  type: "duplicate",
                  onPrimaryAction: async (value) => {
                    duplicateView(value, index);
                    return true;
                  },
                },
                {
                  type: "edit",
                  onAction: (value) => {
                    editView(value);
                  },
                },
                {
                  type: "delete",
                  onPrimaryAction: async () => {
                    await sleep(1);
                    deleteView(index);
                    return true;
                  },
                },
              ],
      })),
    [itemStrings],
  );
  if (filter.event && !isEmpty(filter.event)) {
    const key = "event";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.event),
      onRemove: handleEventByRemove,
    });
  }
  if (filter.duration.length) {
    const key = "duration";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.duration),
      onRemove: handleDurationRemove,
    });
  }
  if (!isEmpty(filter.visited_page)) {
    const key = "visited_page";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.visited_page),
      onRemove: handleVisitedPageRemove,
    });
  }
  if (!isEmpty(filter.exit_page)) {
    const key = "exit_page";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.exit_page),
      onRemove: handleExitPageRemove,
    });
  }
  if (!isEmpty(filter.device)) {
    const key = "device";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.device),
      onRemove: handleDeviceRemove,
    });
  }
  if (!isEmpty(filter.browser)) {
    const key = "browser";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.browser),
      onRemove: handleBrowserRemove,
    });
  }
  if (!isEmpty(filter.operating_system)) {
    const key = "os";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.operating_system),
      onRemove: handleOSRemove,
    });
  }
  if (!isEmpty(filter.location)) {
    const key = "country";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.location),
      onRemove: handleLocationRemove,
    });
  }
  if (filter.page_per_session.length) {
    const key = "page_per_session";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, filter.page_per_session),
      onRemove: handlePagePerSessionRemove,
    });
  }
  function disambiguateLabel(key, value) {
    switch (key) {
      case "duration":
        return value
          .map((val) => `${DurationOptions[val]}`)
          .join(", ")
          .replace(/^/, "Duration is in ");
      case "visited_page": {
        let text = value.join(", ");
        return `Visited Page is ${text.length > 50 ? text.slice(0, 50) + "..." : text}`;
      }
      case "event":
        return value
          .map((val) => `${EventOptions[val]}`)
          .join(", ")
          .replace(/^/, "Event by ");
      case "exit_page": {
        let text = value.join(", ");
        return `Exit Page is ${text.length > 50 ? text.slice(0, 50) + "..." : text}`;
      }
      case "device":
        return `Device is ${value.join(", ")}`;
      case "browser":
        return `Browser is ${value.join(", ")}`;
      case "os":
        return `OS is ${value.join(", ")}`;
      case "country": {
        let text = value
          .map((val) => {
            return COUNTRIES[val];
          })
          .join(", ");
        return `Country is ${text.length > 50 ? text.slice(0, 50) + "..." : text}`;
      }
      case "page_per_session":
        return value
          .map((val) => `${PagePerSessionOptions[val]}`)
          .join(", ")
          .replace(/^/, "Page Per Session is in ");
      default:
        return value;
    }
  }
  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }

  async function deleteFilter(index) {
    setToastActive(false);
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/filter/${sampleFilter[index - 1]._id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    const res = await response.json();
    if (res && res.success) {
      setToastMessage("Delete view successfully.");
      const newFilter = sampleFilter.slice(0, index - 1).concat(sampleFilter.slice(index));
      setSampleFilter(newFilter);
      const newItemStrings = [...itemStrings];
      newItemStrings.splice(index, 1);
      setItemStrings(newItemStrings);
      dispatchSession(setFilterSelected(0));
      setToastActive(true);
    } else {
      setToastMessage("Delete view faild.");
      setToastActive(true);
    }
  }

  async function fetchFilter() {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/filter`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const res = await response.json();
    if (res && res.statusCode === 200) {
      // SampleFilter
      setSampleFilter(res.payload);
      res.payload.map((value, index) => {
        if (value.selected) {
          dispatchSession(setFilterSelected(index + 1));
        }
      });
      setItemStrings([
        "All",
        ...res.payload.map((value) => {
          return value.name;
        }),
      ]);
    }
  }

  async function fetchListPage() {
    const hrefsRes = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/path`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const hrefsJson = await hrefsRes.json();
    if (hrefsJson && (hrefsJson.statusCode === 200 || hrefsJson.statusCode === 404)) {
      let sampleVisitedPages = [];
      hrefsJson.payload.visit.map((url) => {
        let urlPage = new URL(url._id);
        let pathDisplay = url._id.replace(urlPage.origin, "");
        sampleVisitedPages.push({
          label: pathDisplay,
          value: pathDisplay,
          count: url.count,
        });
      });
      setUrlPageSample(sampleVisitedPages);
      let sampleExitPages = [];
      hrefsJson.payload.exit.map((url) => {
        let urlPage = new URL(url._id);
        let pathDisplay = url._id.replace(urlPage.origin, "");
        sampleExitPages.push({
          label: pathDisplay,
          value: pathDisplay,
          count: url.count,
        });
      });
      setExitUrlPageSample(sampleExitPages);
    }
  }

  async function onHandleSave(id, name, filter) {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/filter`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({
        _id: id,
        name: name,
        data: filter,
      }),
    });

    const result = await res.json();
    if (result.success) {
      return true;
    } else {
      return false;
    }
  }

  async function fetchChangeSelected(id) {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/filter/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const result = res.json();
    if (result.statusCode === 200) {
      return true;
    } else {
      return false;
    }
  }

  async function onHandleChangeSelected(index) {
    if (sampleFilter) {
      // await
      try {
        let result = await fetchChangeSelected(
          sampleFilter[index - 1] ? sampleFilter[index - 1]._id : null,
        );
        if (result) {
          dispatchSession(setFilterSelected(index + 1));
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  useEffect(() => {
    if (appPlanCode != "free") {
      fetchListPage();
      fetchFilter();
    }
  }, []);

  useEffect(() => {
    if (selectedFilter === 0) {
      dispatch({ type: "all", payload: DEFAULT_FILTER });
    } else {
      dispatch({
        type: "all",
        payload: sampleFilter[selectedFilter - 1]
          ? sampleFilter[selectedFilter - 1].data
          : DEFAULT_FILTER,
      });
    }
  }, [selectedFilter, sampleFilter]);

  useEffect(() => {
    if (isBasic(currentPlan)) {
      setDisableFilter(false);
    } else {
      setDisableFilter(true);
      setFilterButtonTooltip("Available for Basic and Advanced Plans");
    }
  }, [currentPlan]);

  return (
    <>
      <IndexFilters
        queryPlaceholder="Searching in all"
        hideQueryField
        onQueryClear={() => {}}
        primaryAction={primaryAction}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selectedFilter}
        onSelect={(index) => {
          dispatchSession(setFilterSelected(index));
          onHandleChangeSelected(index);
        }}
        canCreateNewView
        onCreateNewView={onCreateNewView}
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
        loading={loading || tableLoading}
        disabled={disableFilter}
        filteringAccessibilityTooltip={filterButtonTooltip}
      />
    </>
  );
}
