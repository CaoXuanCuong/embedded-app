import("isomorphic-fetch");
import {
  Button,
  ButtonGroup,
  Card,
  EmptySearchResult,
  Grid,
  Icon,
  IndexTable,
  Page,
  SkeletonBodyText,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import { ViewMajor } from "@shopify/polaris-icons";
import { DateRangePicker } from "components/Analytics";
import { CursorPagination } from "components/Pagination";
import FetchingPage from "components/Skeleton/FetchingPage";
import { getCountryName } from "helpers/country.helper";
import { getInactiveTime } from "helpers/time.helper";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";
import { fetchData } from "services/swr.service";
import useSWR from "swr";

export default function Visitors({ jwt }) {
  const router = useRouter();
  const resourceName = {
    singular: "visitor",
    plural: "visitors",
  };

  const headings = [
    { title: "ID" },
    { title: "Sessions", alignment: "center" },
    { title: "Last Active" },
    { title: "Location" },
    { title: "Action" },
  ];

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
      title: "Last 3 days",
      alias: "last3days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 3)).setHours(0, 0, 0, 0)),
        until: new Date(new Date(yesterday).setHours(23, 59, 59, 999)),
      },
    },
    {
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)),
        until: new Date(new Date(yesterday).setHours(23, 59, 59, 999)),
      },
    },
    {
      title: "Last 30 days",
      alias: "last30days",
      period: {
        since: new Date(new Date(new Date().setDate(today.getDate() - 30)).setHours(0, 0, 0, 0)),
        until: new Date(new Date(yesterday).setHours(23, 59, 59, 999)),
      },
    },
    {
      title: "This week",
      alias: "thisweek",
      period: {
        since: new Date(firstDayOfWeek.setHours(0, 0, 0, 0)),
        until: new Date(new Date(today).setHours(23, 59, 59, 999)),
      },
    },
    {
      title: "Last week",
      alias: "lastweek",
      period: {
        since: new Date(firstDayOfLastWeek.setHours(0, 0, 0, 0)),
        until: new Date(
          new Date(firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 1)).setHours(23, 59, 59, 999),
        ),
      },
    },
    {
      title: "This month",
      alias: "thismonth",
      period: {
        since: new Date(firstDayOfMonth.setHours(0, 0, 0, 0)),
        until: new Date(new Date(today).setHours(23, 59, 59, 999)),
      },
    },
    {
      title: "Last month",
      alias: "lastmonth",
      period: {
        since: new Date(firstDayOfLastMonth.setHours(0, 0, 0, 0)),
        until: new Date(
          new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1)).setHours(
            23,
            59,
            59,
            999,
          ),
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

  const emptyStateMarkup = (
    <EmptySearchResult
      title={`No ${resourceName.plural} yet`}
      description={"Try changing the filters or search term"}
      withIllustration
    />
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [visitors, setVisitors] = useState([]);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(visitors);
  const [optionDate, setOptionDate] = useState(() => {
    const optionSession = JSON.parse(sessionStorage.getItem("optionDate")) || "";
    if (optionSession && optionSession.startDate && optionSession.endDate) {
      return optionSession;
    } else {
      return {
        startDate: "",
        endDate: "",
      };
    }
  });
  const [startDate, setStartDate] = useState(optionDate.startDate);
  const [endDate, setEndDate] = useState(optionDate.endDate);

  const handleView = useCallback(
    (visitorId) => {
      router.push("/visitors/[id]", `/visitors/${visitorId}`);
    },
    [router],
  );

  const { data, isLoading } = useSWR(
    [
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/visitors?page=${currentPage}&startDate=${startDate}&endDate=${endDate}`,
      jwt,
    ],
    fetchData,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (data && (data.statusCode === 200 || data.statusCode === 404)) {
      setVisitors(data.payload);
      setTotalPage(data.total);
      setCurrentPage(data.current);
    }
  }, [jwt, data]);

  const handleApplyDate = useCallback(
    (option) => {
      const newOptions = {
        ...optionDate,
        startDate: option.period.since,
        endDate: option.period.until,
      };
      setOptionDate(newOptions);
      setStartDate(new Date(newOptions.startDate).toISOString());
      setEndDate(new Date(newOptions.endDate).toISOString());
      sessionStorage.setItem("optionDate", JSON.stringify(newOptions));
    },
    [optionDate],
  );

  return (
    <Page title="Visitors">
      <Grid gap={{ xl: "32px" }}>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
          <div className="visitor-filter">
            <DateRangePicker ranges={dateOptions} disableAfter={today} onApply={handleApplyDate} />
          </div>
        </Grid.Cell>
      </Grid>
      {isLoading ? (
        <FetchingPage />
      ) : (
        <>
          {isLoading && (
            <>
              <SkeletonBodyText />
              <SkeletonBodyText />
              <SkeletonBodyText />
            </>
          )}
          {!isLoading && (
            <Card>
              <div className="visitor-table">
                <IndexTable
                  resourceName={resourceName}
                  itemCount={visitors.length}
                  headings={headings}
                  emptyState={emptyStateMarkup}
                  selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                  onSelectionChange={handleSelectionChange}
                  selectable={false}
                >
                  {visitors.map((item, index) => {
                    const { _id, lastActive, updatedAt, location, countSession, address } = item;
                    const locationContent = address?.city
                      ? `${address.city}${
                          address.state ? `/${address.state}` : ""
                        } - ${getCountryName(location)}`
                      : getCountryName(location);
                    return (
                      <IndexTable.Row
                        id={_id}
                        key={_id}
                        position={index}
                        selected={selectedResources.includes(_id)}
                      >
                        <IndexTable.Cell>{_id}</IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text as="span" alignment="center">
                            <div className="mida-count-pages">{countSession}</div>
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          {getInactiveTime(lastActive ? lastActive : updatedAt)}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <div className="mida-visitors location">{locationContent}</div>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <ButtonGroup>
                            <Button
                              icon={<Icon source={ViewMajor} tone="success" />}
                              onClick={() => handleView(_id)}
                            >
                              View
                            </Button>
                          </ButtonGroup>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    );
                  })}
                </IndexTable>
              </div>
            </Card>
          )}
          <br />
          <CursorPagination
            loading={isLoading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={totalPage}
          />
          <br />
        </>
      )}
    </Page>
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
