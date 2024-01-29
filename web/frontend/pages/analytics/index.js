import("isomorphic-fetch");
import { Grid, Layout, Page, Toast } from "@shopify/polaris";
import { DateRangePicker, LocationChart, TopPage } from "components/Analytics";
import { OrderFunnel, SingleDonutChart, SingleLineChart } from "components/Analytics/Viz";
import { VISITOR_CHART_OPTIONS } from "consts/Analytic.const";
import LocalStorageConst from "consts/LocalStorage.const";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import {
  analyticActions,
  selectAnalyticFetching,
  selectAnalyticFilter,
  selectAnalyticOptions,
  selectAnalyticSession,
  selectOrderFunnel,
  selectSessionDonut,
  selectSessionLine,
  selectSessionLocation,
  selectSuccessOrder,
  selectTopPage,
  selectUniqueVisitor,
  selectVisitorChart,
} from "redux/reducers/analytic.reducer";
import { wrapper } from "redux/store";

export default function Analytics({ jwt }) {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0),
  );
  const todayIndex = today.getDay();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfWeek = new Date(
    new Date().setDate(today.getDate() - todayIndex + (todayIndex == 0 ? -6 : 1)),
  );
  const firstDayOfLastWeek = new Date(
    firstDayOfWeek.getFullYear(),
    firstDayOfWeek.getMonth(),
    firstDayOfWeek.getDate() - 7,
  );

  const dateOptions = [
    {
      title: "Today",
      alias: "today",
      period: {
        since: today,
        until: today,
      },
    },
    {
      title: "Yesterday",
      alias: "yesterday",
      period: {
        since: yesterday,
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
      title: "Last 30 days (All)",
      alias: "last30days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 30)).setHours(0, 0, 0, 0)),
        until: yesterday,
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
      title: "Custom",
      alias: "custom",
      period: {
        since: today,
        until: today,
      },
    },
  ];

  const router = useRouter();
  const dispatch = useDispatch();
  const fetching = useSelector(selectAnalyticFetching);
  const options = useSelector(selectAnalyticOptions);
  const filter = useSelector(selectAnalyticFilter);
  const topPages = useSelector(selectTopPage);
  const uniqueVisitors = useSelector(selectUniqueVisitor);
  const sessions = useSelector(selectAnalyticSession);
  const visitors = useSelector(selectVisitorChart);
  const sessionLine = useSelector(selectSessionLine);
  const sessionLocation = useSelector(selectSessionLocation);
  const sessionDonut = useSelector(selectSessionDonut);
  const orderFunnel = useSelector(selectOrderFunnel);
  const orderSuccess = useSelector(selectSuccessOrder);

  const [toast, setToast] = useState({});

  useEffect(() => {
    let newFilter = { ...filter };
    if (!newFilter?.dateOption) {
      newFilter = {
        ...newFilter,
        dateOption: {
          title: "Today",
          alias: "today",
          period: {
            since: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
            until: new Date(new Date().setHours(23, 59, 59, 999)).getTime(),
          },
        },
      };
      dispatch(analyticActions.setFilter(newFilter));
      return;
    }
    dispatch(analyticActions.fetchAnalytic({ jwt, ...newFilter }));
  }, [jwt, filter, dispatch]);

  useEffect(() => {
    const { visitor } = options;

    if (visitor === "unique") {
      dispatch(analyticActions.setVisitors(uniqueVisitors));
      return;
    }

    if (visitor === "total") {
      dispatch(analyticActions.setVisitors(sessions?.[0]?.visitorsBySession));
      return;
    }
  }, [options, uniqueVisitors, sessions, dispatch]);

  const handleApplyDate = useCallback(
    (option) => {
      let limitRangeDate = option.period.until.getTime() - option.period.since.getTime();
      let diffDays = Math.round(limitRangeDate / (1000 * 3600 * 24));
      if (diffDays > 31) {
        setToast({ active: true, message: "Filter by date not more than 31 days" });
        return;
      }
      const newOptionDate = {
        ...option,
        period: {
          since: option.period.since.setHours(0, 0, 0, 0),
          until: option.period.until.setHours(23, 59, 59, 999),
        },
      };
      dispatch(
        analyticActions.setFilter({
          ...filter,
          dateOption: newOptionDate,
        }),
      );
    },
    [filter, dispatch],
  );

  const toggleToastActive = useCallback(
    () =>
      setToast((toast) => {
        return { ...toast, active: !toast?.active };
      }),
    [],
  );

  const toastMarkup = toast?.active ? (
    <Toast content={toast?.message} onDismiss={toggleToastActive} />
  ) : null;

  const handleVisitorOptionChange = useCallback(
    (key) => {
      dispatch(analyticActions.setOptions({ ...options, visitor: key }));
    },
    [options, dispatch],
  );

  const handleClickPage = useCallback(
    (href) => {
      localStorage.setItem(LocalStorageConst.PAGE_VIEW, JSON.stringify(href));
      router.push("/pageviews");
    },
    [router],
  );

  return (
    <div className="analytic-container">
      <Page title="Analytics" fullWidth>
        {toastMarkup}
        <Layout>
          <Layout.Section>
            <Grid gap={{ xl: "32px" }}>
              {/* Filter */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                <div className="analytic-filter">
                  <DateRangePicker
                    ranges={dateOptions}
                    disableAfter={today}
                    onApply={handleApplyDate}
                  />
                </div>
              </Grid.Cell>

              {/* Visitor & Session */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <SingleLineChart
                  title={options?.visitor}
                  state={options?.visitor === "unique" ? fetching?.visitors : fetching?.sessions}
                  name={visitors?.name}
                  data={visitors?.data}
                  total={visitors?.total}
                  options={VISITOR_CHART_OPTIONS}
                  onChangeOption={handleVisitorOptionChange}
                />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <SingleLineChart
                  title="Sessions"
                  state={fetching?.sessions}
                  name={sessionLine?.name}
                  data={sessionLine?.data}
                  total={sessionLine?.total}
                />
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <SingleLineChart
                  title="Successful Orders"
                  state={fetching?.funnel}
                  name={orderSuccess?.name}
                  data={orderSuccess?.data}
                  total={orderSuccess?.total}
                />
              </Grid.Cell>

              {/* Locations & Top Pages */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 8 }}>
                <LocationChart
                  title="Locations"
                  data={sessionLocation?.data}
                  perList={sessionLocation?.perList}
                />
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 4 }}>
                <TopPage title="Top Pages" pages={topPages} onClick={handleClickPage} />
              </Grid.Cell>

              {/* Order Funnel */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                <OrderFunnel title="Orders Funnel" state={fetching?.funnel} data={orderFunnel} />
              </Grid.Cell>

              {/* Donut */}
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <SingleDonutChart
                  title="Browsers"
                  state={fetching?.sessions}
                  data={sessionDonut?.browser}
                />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <SingleDonutChart
                  title="Devices "
                  state={fetching?.sessions}
                  data={sessionDonut?.device}
                />
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <SingleDonutChart
                  title="Operation Systems"
                  state={fetching?.sessions}
                  data={sessionDonut?.os}
                />
              </Grid.Cell>
            </Grid>
            <div style={{ marginBottom: "36px" }}></div>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req, res }) => {
  let jwt = req.cookies["midaJWT"];

  if (jwt) {
    if (!store.getState().general.name) {
      store.dispatch(SAGA_GET_SHOP_DATA_ASYNC(jwt));
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
    if (!store.getState().general.isAuthenticated) {
      res.writeHead(301, { Location: "/login.html" });
      res.end();
    }
  } else {
    res.writeHead(301, { Location: "/login.html" });
    res.end();
  }

  return {
    props: {
      jwt,
    },
  };
});
