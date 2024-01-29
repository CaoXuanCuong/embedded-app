import("isomorphic-fetch");
import {
  BlockStack,
  Button,
  Card,
  Filters,
  Grid,
  InlineStack,
  ResourceItem,
  ResourceList,
  Text,
} from "@shopify/polaris";
import {
  CheckoutMajor,
  CustomersMajor,
  EmailMajor,
  HomeMajor,
  ListMajor,
  PageMinusMajor,
  PaymentsMajor,
  ProductsMajor,
  RecentSearchesMajor,
  ViewMinor,
} from "@shopify/polaris-icons";
import { DateRangePicker } from "components/Analytics";
import HeatmapDevice from "components/Heatmap/Device";
import { CursorPagination } from "components/Pagination";
import { HEATMAP_DEVICE } from "consts/Heatmap.const";
import {
  getDate30DaysAgo,
  getFirstDayOfLastWeek,
  getFirstDayOfMonth,
  getFirstDayOfWeek,
  getLast24Hours,
  getToday,
  getYesterday,
} from "helpers/date.helper";
import { formatUrlListingHM, formatUrlRedirectHM } from "helpers/format.helper";
import { pageType } from "helpers/heatmap.helper";
import useDebounce from "hooks/useDebounce";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchData } from "services/swr.service";
import useSWR from "swr";
import styles from "./component.module.css";
import { useDispatch, useSelector } from "react-redux";
import { heatmapActions, selectHeatmapFilter } from "redux/reducers/heatmap.reducer";

export default function PageTable({ jwt }) {
  const dispatch = useDispatch();
  const heatmapFilter = useSelector(selectHeatmapFilter);
  const activeOptionDate = useMemo(
    () => ({
      title: heatmapFilter.date.title,
      alias: heatmapFilter.date.type,
      period: {
        since: new Date(heatmapFilter.date.start),
        until: new Date(heatmapFilter.date.end),
      },
    }),
    [],
  );

  const pageInfo = useMemo(() => {
    return [
      { name: "Homepage", icon: HomeMajor, class: styles.home_icon },
      { name: "Collections", icon: ListMajor, class: styles.collection_icon },
      { name: "Product Page", icon: ProductsMajor, class: styles.product_icon },
      { name: "Cart Page", icon: CheckoutMajor, class: styles.cart_icon },
      { name: "Checkout Page", icon: PaymentsMajor, class: styles.checkout_icon },
      { name: "Account Login", icon: CustomersMajor, class: styles.account_icon },
      { name: "Search Page", icon: RecentSearchesMajor, class: styles.search_icon },
      { name: "Contact Page", icon: EmailMajor, class: styles.contact_icon },
      { name: "Other", icon: PageMinusMajor, class: styles.other_icon },
    ];
  }, []);

  const router = useRouter();

  const [pages, setPages] = useState([]);
  const [queryValue, setQueryValue] = useState(heatmapFilter.queryTitle);
  const queryDebounceValue = useDebounce(queryValue, 800);
  const [totalPage, setTotalPage] = useState(1);
  const [filter, setFilter] = useState({
    startDate: heatmapFilter.date.start,
    endDate: heatmapFilter.date.end,
    typeDate: heatmapFilter.date.type,
    device: HEATMAP_DEVICE.DESKTOP,
    sortValue: "APPEARANCE_DESC",
    currentPage: 1,
  });

  const { data, isLoading } = useSWR(
    [formatUrlListingHM(filter, queryDebounceValue), jwt],
    fetchData,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    dispatch(
      heatmapActions.setFilter({
        ...heatmapFilter,
        queryTitle: queryDebounceValue,
      }),
    );
  }, [queryDebounceValue, dispatch]);

  const handleFilterChange = useCallback((value) => {
    setFilter((filter) => {
      return {
        ...filter,
        ...value,
      };
    });
  }, []);

  const handlePageChange = useCallback((value) => {
    handleFilterChange({
      currentPage: value,
    });
  }, []);

  const handleQueryValueChange = useCallback((value) => {
    setQueryValue(value);
  }, []);

  const handleQueryValueRemove = useCallback(() => {
    setQueryValue("");
  }, []);

  const handleClearAll = useCallback(() => {
    handleQueryValueRemove();
  }, [handleQueryValueRemove]);

  const handleSortPages = useCallback(
    (value) => {
      let newPages = [...pages];

      newPages.sort(function (a, b) {
        return value == "APPEARANCE_DESC"
          ? b.totalPageViews - a.totalPageViews
          : a.totalPageViews - b.totalPageViews;
      });

      setPages(newPages);
    },
    [pages],
  );

  const filterControl = (
    <Filters
      queryValue={queryValue}
      filters={[]}
      onQueryChange={handleQueryValueChange}
      onQueryClear={handleQueryValueRemove}
      onClearAll={handleClearAll}
    ></Filters>
  );

  useEffect(() => {
    if (data && data.statusCode === 200) {
      if (!data?.payload?.length) {
        setPages([]);
      } else {
        let pageList = data.payload.map((item) => {
          try {
            let url = new URL(item.address);
            let pathName = url.pathname;

            return {
              title: item.title,
              pathName: pathName,
              id: item._id,
              totalPageViews: item.totalPageViews,
              lastHeatmap: item.lastHeatmap,
            };
          } catch (e) {
            console.log(`[MSR PageTable error]: `, e);
            return null;
          }
        });
        pageList = pageList.filter((i) => i);
        setPages(pageList);
      }
      setTotalPage(data.total);
    } else if (data && data.statusCode === 404) {
      setPages([]);
      setTotalPage(data.total);
    }
  }, [data]);

  // date options
  const last24hours = getLast24Hours();
  const today = getToday();
  const yesterday = getYesterday();
  const firstDayOfWeek = getFirstDayOfWeek();
  const firstDayOfLastWeek = getFirstDayOfLastWeek();
  const firstDayOfMonth = getFirstDayOfMonth();
  const date30DaysAgo = getDate30DaysAgo();

  const dateOptions = [
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
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)),
        until: new Date(new Date(yesterday).setHours(23, 59, 59)),
      },
    },
    {
      title: "Last 30 days",
      alias: "last30days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 30)).setHours(0, 0, 0, 0)),
        until: new Date(new Date(today).setHours(23, 59, 59)),
      },
    },
    {
      title: "This week",
      alias: "thisweek",
      period: {
        since: new Date(firstDayOfWeek.setHours(0, 0, 0, 0)),
        until: new Date(new Date(today).setHours(23, 59, 59)),
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
        until: new Date(new Date(today).setHours(23, 59, 59)),
      },
    },
    {
      title: "Last month",
      alias: "lastmonth",
      period: {
        since: new Date(date30DaysAgo.setHours(0, 0, 0, 0)),
        until: new Date(
          new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1)).setHours(23, 59, 59),
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

  const disableBefore = useMemo(
    () => new Date(date30DaysAgo.setHours(0, 0, 0, 0)),
    [date30DaysAgo],
  );

  const handleApplyDate = useCallback(
    (option) => {
      const date = {
        startDate: option.period.since.toISOString(),
        endDate: option.period.until.toISOString(),
        typeDate: option.alias,
      };
      handleFilterChange(date);
      dispatch(
        heatmapActions.setFilter({
          ...heatmapFilter,
          date: {
            title: option.title,
            type: option.alias,
            start: option.period.since,
            end: option.period.until,
          },
        }),
      );
    },
    [handleFilterChange],
  );

  const handleHeatmapDeviceChange = useCallback(
    (value) => {
      handleFilterChange({ device: value });
    },
    [handleFilterChange],
  );

  const handleWatchClick = useCallback(
    (id) => {
      const queryParams = formatUrlRedirectHM(filter);
      router.push(`heatmaps/${id}?${queryParams}`);
    },
    [filter],
  );

  return (
    <>
      <Grid gap={{ xl: "32px" }}>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
          <div className={styles.mida_hm_filter}>
            <DateRangePicker
              ranges={dateOptions}
              disableAfter={today}
              disableBefore={disableBefore}
              onApply={handleApplyDate}
              activeOption={activeOptionDate}
            />
            <HeatmapDevice
              heatmapDevice={filter.device}
              onHeatmapDeviceChange={handleHeatmapDeviceChange}
            />
          </div>
        </Grid.Cell>
      </Grid>
      <Card padding="300">
        <ResourceList
          resourceName={{ singular: "page", plural: "pages" }}
          items={pages}
          renderItem={renderItem}
          sortValue={filter.sortValue}
          filterControl={filterControl}
          sortOptions={[
            { label: "Most Active Pages", value: "APPEARANCE_DESC" },
            { label: "Less Active Pages", value: "APPEARANCE_ASC" },
          ]}
          onSortChange={(selected) => {
            handleFilterChange({ sortValue: selected });
            handleSortPages(selected);
          }}
          showHeader
          loading={isLoading}
        />
      </Card>
      <div className={styles.mida_mp_pagination}>
        <CursorPagination
          loading={isLoading}
          currentPage={filter.currentPage}
          setCurrentPage={handlePageChange}
          total={totalPage}
        />
      </div>
    </>
  );

  function renderItem(item) {
    const { title, pathName, id, totalPageViews } = item;

    return (
      <ResourceItem id={id}>
        <div className={styles.hm_page_list_container}>
          <div className={[styles.hm_page_title, pageInfo[pageType(pathName)].class].join(" ")}>
            <InlineStack gap="300" blockAlign="center">
              <Button icon={pageInfo[pageType(pathName)].icon} disabled></Button>
              <BlockStack gap="100">
                <Text as="span" fontWeight="semibold">
                  {title}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {pathName}
                </Text>
              </BlockStack>
            </InlineStack>
          </div>

          <div className={styles.hm_page_type}>
            <BlockStack gap="100">
              <Text as="p" tone="subdued" variant="bodySm">
                Type:
              </Text>
              <Text>{pageInfo[pageType(pathName)].name}</Text>
            </BlockStack>
          </div>

          <div className={styles.hm_page_activity}>
            <BlockStack gap="100">
              <Text as="p" tone="subdued" variant="bodySm">
                Activity:
              </Text>
              <Text>{totalPageViews} Pageviews</Text>
            </BlockStack>
          </div>

          <div className={styles.hm_page_button_group}>
            <Button size="large" onClick={() => handleWatchClick(id)} icon={ViewMinor}>
              Watch
            </Button>
          </div>
        </div>
      </ResourceItem>
    );
  }
}
