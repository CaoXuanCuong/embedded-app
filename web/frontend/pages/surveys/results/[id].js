import("isomorphic-fetch");
import { Button, Card, Layout, Page, Tabs } from "@shopify/polaris";
import { AdditionalFeedback, Summary, VisitorChoiceTable } from "components/Surveys/Analytics";
import ResponseTable from "components/Surveys/ResponseTable";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";
import { surveyApi } from "services/survey.service";
import { selectShop } from "redux/reducers/general.reducer";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSurveyAnalyticCache,
  selectSurveyAnalyticFilter,
  selectSurveyAnalyticTabActive,
  surveyActions,
} from "redux/reducers/survey.reducer";
import { findResponses } from "services/response.service";

const tabs = [
  {
    id: "summary",
    content: "Summary",
    panelID: "summary-content-1",
  },
  {
    id: "visitor",
    content: "Visitors",
    panelID: "visitor-content-1",
  },
  {
    id: "feedback",
    content: "Additional feedback",
    panelID: "additional-feedbacks-content-1",
  },
];

export default function SurveyResult({ jwt }) {
  const router = useRouter();
  const {
    query: { id, type: surveyType },
  } = router;

  const dispatch = useDispatch();
  const { appPlanCode } = useSelector(selectShop);
  const tabActive = useSelector(selectSurveyAnalyticTabActive);
  const filter = useSelector(selectSurveyAnalyticFilter);
  const surveyCache = useSelector(selectSurveyAnalyticCache);
  const [analytics, setAnalytics] = useState({
    isFetched: false,
    name: "",
    count_visitor_reached: 0,
    count_response: 0,
    options: [],
  });
  const [feedback, setFeedback] = useState({
    fetching: false,
    data: [],
    pagination: {
      page: 1,
      limit: 9,
      totalRecords: 0,
    },
  });
  const [visitor, setVisitor] = useState({
    fetching: false,
    data: [],
    total: 0,
  });

  const [selected, setSelected] = useState(0);
  const [fetchingData, setFetchingData] = useState({
    common: false,
    chart: "Success",
  });

  useEffect(() => {
    if (!id || !surveyType) return;
    const fetchData = async () => {
      try {
        setFetchingData((prev) => ({ ...prev, common: true, chart: "Loading" }));
        const data = await surveyApi.getAnalytic(jwt, id, surveyType);
        if (data && data.statusCode === 200) {
          const analytics = data.payload;
          const temp = analytics?.[0] ?? {};
          const infoSurvey = temp.info?.[0] || {};

          setAnalytics({
            ...temp,
            isFetched: true,
            name: infoSurvey.name ?? "",
            createdAt: infoSurvey.createdAt,
            count_visitor_reached: infoSurvey.visitor_reached ?? 0,
            count_response: temp.totalResponse?.[0]?.count ?? 0,
            question: infoSurvey.questions?.find((item) => item.type === "choices") ?? {},
          });
        }
        setFetchingData((prev) => ({ ...prev, common: false, chart: "Success" }));
      } catch (error) {
        console.log(error);
        setFetchingData((prev) => ({ ...prev, common: true, chart: "Error" }));
      }
    };
    fetchData();
  }, [jwt, id, surveyType]);

  useEffect(() => {
    if (!surveyCache) {
      dispatch(surveyActions.setAnalyticSurveyCache(id));
    } else if (surveyCache !== id) {
      dispatch(surveyActions.resetAnalyticFilter(id));
      return;
    }

    if (tabActive === "feedback") {
      const fetchFeedback = async () => {
        try {
          setFeedback((prev) => ({ ...prev, fetching: true }));
          const { dateOption, ...rest } = filter.feedback;

          if (!dateOption) throw "No date option";
          const startDate = new Date(
            new Date(dateOption.period.since).setHours(0, 0, 0, 0),
          ).toISOString();
          const endDate = new Date(
            new Date(dateOption.period.until).setHours(23, 59, 29, 999),
          ).toISOString();

          const res = await surveyApi.getFeedback({ jwt, id, startDate, endDate, ...rest });
          if (res?.statusCode === 200) {
            setFeedback((prev) => ({ ...prev, data: res.data, pagination: res.pagination }));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setFeedback((prev) => ({ ...prev, fetching: false }));
        }
      };
      fetchFeedback();
    }

    if (tabActive === "visitor" && surveyType === "multiple-choice") {
      const fetchVisitor = async () => {
        try {
          setVisitor((prev) => ({ ...prev, fetching: true }));
          const { page } = filter?.visitor;
          const query = `?id=${id}&page=${page}&type=${surveyType}`;
          const res = await findResponses(query, jwt);
          if (res.ok) {
            setVisitor((prev) => ({
              ...prev,
              data: res.data.payload,
              total: res.data.total,
            }));
          }
        } catch (error) {
          console.log(error);
        } finally {
          setVisitor((prev) => ({ ...prev, fetching: false }));
        }
      };

      fetchVisitor();
    }
  }, [jwt, id, surveyType, tabActive, filter]);

  // Fix for first load
  useEffect(() => {
    dispatch(surveyActions.setAnalyticTabActive("summary"));
  }, []);

  const handleTabChange = useCallback((value) => {
    setSelected(value);
    const tabId = tabs[value].id;
    dispatch(surveyActions.setAnalyticTabActive(tabId));
  }, []);

  const handleEditSurvey = useCallback(() => {
    router.push({
      pathname: `/surveys/${id}`,
      query: {
        type: surveyType,
      },
    });
  }, [router, surveyType, id]);

  const handleFeedbackFilterChange = useCallback(
    (newFilter) => {
      dispatch(
        surveyActions.setAnalyticFilter({
          ...newFilter,
          dateOption: {
            ...newFilter.dateOption,
            period: {
              since: new Date(newFilter.dateOption.period.since).toISOString(),
              until: new Date(newFilter.dateOption.period.until).toISOString(),
            },
          },
        }),
      );
    },
    [dispatch],
  );

  const handleVisitorFilterChange = useCallback(
    (newFilter) => {
      dispatch(surveyActions.setAnalyticFilter(newFilter));
    },
    [dispatch],
  );

  return (
    <Page
      title={analytics.name}
      backAction={{ content: "Surveys", onAction: () => router.push("/surveys") }}
      primaryAction={
        <Button variant="primary" onClick={handleEditSurvey} disabled={appPlanCode === "free"}>
          Edit survey
        </Button>
      }
    >
      <Layout>
        {/* Nav */}
        <Layout.Section>
          <Card padding="0">
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
          </Card>
        </Layout.Section>

        {/* Summary Tab */}
        {tabActive === "summary" ? (
          <Summary type={surveyType} data={analytics} fetchingData={fetchingData} />
        ) : null}

        {/* Visitor Tab */}
        {tabActive === "visitor" ? (
          <Layout.Section>
            {surveyType === "multiple-choice" ? (
              <VisitorChoiceTable
                visitors={visitor?.data}
                loading={visitor?.fetching}
                totalPage={visitor?.total}
                filter={filter?.visitor}
                onFilterChange={handleVisitorFilterChange}
              />
            ) : (
              <ResponseTable jwt={jwt} type={surveyType} />
            )}
          </Layout.Section>
        ) : null}

        {tabActive === "feedback" ? (
          <Layout.Section>
            <AdditionalFeedback
              data={feedback?.data}
              filter={filter?.feedback}
              loading={feedback?.fetching}
              pagination={feedback?.pagination}
              onFilterChange={handleFeedbackFilterChange}
            />
          </Layout.Section>
        ) : null}
      </Layout>
      <br />
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
