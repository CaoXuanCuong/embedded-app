import("isomorphic-fetch");
import {
  LegacyCard,
  ContextualSaveBar,
  FormLayout,
  Icon,
  InlineError,
  Layout,
  Page,
  Select,
  TextField,
  Toast,
  Tooltip,
  Modal,
  Text,
  Box,
  InlineStack,
} from "@shopify/polaris";
import { wrapper } from "redux/store";
import { END } from "redux-saga";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createSurvey, findSurvey } from "services/survey.service";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { QUESTIONS } from "consts/SurveyQuestion.const";
import { CircleInformationMajor } from "@shopify/polaris-icons";
import { useRouter } from "next/router";
import SelectPage from "components/Forms/SelectPage";
import SelectDelayTime from "components/Forms/SelectDelayTime";
import SelectDevice from "components/Forms/SelectDevice";
import SelectPosition from "components/Forms/SelectPosition";
import SurveyFormPreview from "components/Surveys/Preview/SurveyFormPreview";
import useDebounce from "hooks/useDebounce";

const statusOptions = [
  { label: "Enable", value: true },
  { label: "Disable", value: false },
];
const MIN_PRIORITY = 0,
  MAX_PRIORITY = 99;

export default function Survey({ jwt }) {
  const router = useRouter();
  const {
    query: { id, type: choiceType },
  } = router;

  const initialState = useMemo(() => {
    return {
      name: "",
      priority: "0",
      status: true,
      position: 0,
      delay_time: 3,
      delay_time_type: 0,
      apply_pages: [],
      apply_specific_pages: [],
      apply_devices: ["Desktop", "Tablet", "Mobile"],
      feedbackOptions: false,
      questions: QUESTIONS.map((item) => {
        if (choiceType === "multiple-choice" && item.type === "text") {
          const { headingDisLike, placeholderDisLike, ...rest } = item;
          return rest;
        }
        return item;
      }).filter((item) => {
        if (choiceType === "multiple-choice") {
          return item.type !== "vote";
        }
        return item.type !== "choices";
      }),
    };
  }, [choiceType]);

  const { myshopifyDomain } = useSelector(selectShop);
  const [surveyData, setSurveyData] = useState(initialState);
  const [loadingSave, setLoadingSave] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [error, setError] = useState({});
  const [handleModal, setHandleModal] = useState(false);
  const prevSurveyDataRef = useRef(JSON.parse(JSON.stringify(surveyData)));

  const handleToggleToast = useCallback(() => {
    setToastActive((toastActive) => !toastActive);
  }, []);

  const handleChangeStatus = (value) => {
    setSurveyData({
      ...surveyData,
      status: value === "true",
    });
  };

  const handleChangeName = (name) => {
    if (validateName(name)) {
      setError((prev) => ({ ...prev, name: false }));
    } else {
      setError((prev) => ({ ...prev, name: true }));
    }
    setSurveyData({
      ...surveyData,
      name: name,
    });
  };

  const handleChangePriority = (priority) => {
    if (validatePriority(priority)) {
      setError((prev) => ({ ...prev, priority: false }));
      if (priority.length > 1 && priority[0] == "0") priority = priority.substring(1);
      priority = Math.round(parseFloat(priority));
      if (priority < MIN_PRIORITY) {
        priority = MIN_PRIORITY.toString();
      }
      if (priority > MAX_PRIORITY) {
        priority = MAX_PRIORITY.toString();
      }
    } else {
      setError((prev) => ({ ...prev, priority: true }));
    }
    setSurveyData({
      ...surveyData,
      priority: priority,
    });
  };

  const handleSave = useCallback(async () => {
    setLoadingSave(true);
    const errorTemp = {};

    if (!validateName(surveyData.name)) {
      errorTemp.name = true;
    }

    if (!validatePriority(surveyData.priority + "")) {
      errorTemp.priority = true;
    }

    if (
      surveyData.delay_time_type == 1 &&
      (!surveyData.delay_time ||
        !/^\d+$/.test(surveyData.delay_time) ||
        surveyData.delay_time < 3 ||
        surveyData.delay_time > 300)
    ) {
      errorTemp.delay_time = "Please enter an integer between 3 and 300";
    }

    if (choiceType === "multiple-choice") {
      const choiceQuestion = surveyData.questions?.find((item) => item.type === "choices");
      if (!validateName(choiceQuestion.heading)) {
        errorTemp.choiceQuestion = "Required field";
      }
      const requiredOptions = choiceQuestion.options.some((item) => !validateName(item));
      if (requiredOptions) {
        errorTemp.choiceOption = true;
      }
    }

    if (Object.keys(errorTemp).length > 0) {
      setError(errorTemp);
      setLoadingSave(false);
      return;
    }

    setError({});
    try {
      const res = await createSurvey(surveyData, jwt);
      if (res.success) {
        setToastMessage(res.message);
        handleToggleToast();
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push("/surveys");
      } else {
        setToastMessage(res.message);
        handleToggleToast();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSave(false);
    }
  }, [surveyData, choiceType, router, handleToggleToast, jwt]);

  const handleSetSurveyData = (data) => {
    setSurveyData({
      ...surveyData,
      ...data,
    });
  };

  const fetchData = useCallback(async () => {
    try {
      if (id !== "add") {
        const surveyRes = await findSurvey(id, jwt);
        const { ok, data } = surveyRes;
        if (ok) {
          setSurveyData(data.payload);
          prevSurveyDataRef.current = JSON.parse(JSON.stringify(data.payload));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [id, jwt]);

  const waitUserInput = useDebounce(surveyData, 200);

  const contextualSaveBarMarkup = useMemo(
    () => {
      if (JSON.stringify(surveyData) === JSON.stringify(initialState)) {
        return null;
      }
      if (
        id !== "add" &&
        JSON.stringify(surveyData) === JSON.stringify(prevSurveyDataRef.current)
      ) {
        return null;
      }
      return (
        <ContextualSaveBar
          message={"Unsaved changes"}
          saveAction={{
            onAction: handleSave,
            content: "Save",
            loading: loadingSave,
          }}
        />
      );
    },
    // eslint-disable-next-line
    [waitUserInput],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBackToSurvey = () => {
    if (JSON.stringify(surveyData) === JSON.stringify(prevSurveyDataRef.current)) {
      router.back(-1);
    } else {
      setHandleModal(true);
    }
  };

  return (
    <Page backAction={{ content: "Products", onAction: handleBackToSurvey }} title="Edit survey">
      {contextualSaveBarMarkup}
      {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}

      <Layout>
        <Layout.Section>
          <Box paddingBlockEnd="400">
            <Text variant="headingLg" as="h5">
              General Settings
            </Text>
          </Box>
          <LegacyCard sectioned title="General Information">
            <FormLayout>
              <TextField
                id={"rule-name"}
                label="Name"
                value={surveyData.name}
                onChange={(value) => handleChangeName(value)}
              />
              {error?.name && <InlineError message="Rule name is required" fieldID="rule-name" />}
              <TextField
                id={"rule-priority"}
                type="number"
                label="Priority"
                value={surveyData.priority.toString()}
                onChange={(value) => handleChangePriority(value)}
                helpText={`Please enter an integer from ${MIN_PRIORITY} to ${MAX_PRIORITY}. ${MIN_PRIORITY} is the highest priority.`}
              />
              {error?.priority && (
                <InlineError message="Rule priority is invalid" fieldID="rule-priority" />
              )}
              <Select
                label="Status"
                options={statusOptions}
                onChange={handleChangeStatus}
                value={surveyData.status}
              />
            </FormLayout>
          </LegacyCard>
          <LegacyCard sectioned title="Display on pages">
            <SelectPage
              surveyData={surveyData}
              onSetSurveyData={handleSetSurveyData}
              domain={myshopifyDomain}
            />
          </LegacyCard>
          <LegacyCard sectioned title="Display on devices">
            <SelectDevice surveyData={surveyData} onSetSurveyData={handleSetSurveyData} />
          </LegacyCard>
          <LegacyCard
            sectioned
            title={
              <InlineStack gap={150}>
                <Text variant="headingSm" as="h3">
                  Delay time
                </Text>
                <Tooltip content="Delay time might be a bit longer in reality due to visitor's internet speed.">
                  <Icon source={CircleInformationMajor} />
                </Tooltip>
              </InlineStack>
            }
          >
            <SelectDelayTime
              error={error?.delay_time}
              surveyData={surveyData}
              onSetSurveyData={handleSetSurveyData}
            />
          </LegacyCard>
          <LegacyCard sectioned title="Position">
            <SelectPosition surveyData={surveyData} onSetSurveyData={handleSetSurveyData} />
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <Box paddingBlock="400">
            <Text variant="headingLg" as="h5">
              Display Settings
            </Text>
          </Box>
          <SurveyFormPreview
            error={error}
            surveyData={surveyData}
            surveyType={choiceType}
            onSetSurveyData={handleSetSurveyData}
          />
          <div style={{ marginTop: "20px" }}></div>
        </Layout.Section>
      </Layout>
      <Modal
        open={handleModal}
        title={"Leave page with unsaved changes?"}
        primaryAction={{
          content: "Leave page",
          onAction: () => {
            setHandleModal(false);
            router.back(-1);
          },
        }}
        secondaryActions={[
          {
            content: "Stay",
            onAction: () => setHandleModal(false),
          },
        ]}
      >
        <Modal.Section>
          <p>Leaving this page will delete all unsaved changes.</p>
        </Modal.Section>
      </Modal>
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
const validatePriority = (priority) => {
  if (priority.trim().length == 0) return false;
  return true;
};
const validateName = (name) => {
  if (name.trim().length == 0) return false;
  return true;
};
