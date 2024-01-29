import("isomorphic-fetch");

import { Button, Page, Toast } from "@shopify/polaris";
import SurveyTable from "components/Surveys/SurveyTable";
import { useRouter } from "next/router";
import { wrapper } from "redux/store";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { selectShop } from "redux/reducers/general.reducer";
import { useSelector } from "react-redux";
import ModuleControl from "components/Common/ModuleControl";
import { useCallback, useState } from "react";
import { AddSurveyModal } from "components/Surveys/MultipleChoice";

export default function Surveys({ jwt }) {
  const { appPlanCode } = useSelector(selectShop);
  const router = useRouter();

  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [addActive, setAddActive] = useState(false);

  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handleToastMessage = (value) => {
    setToastMessage(value);
  };

  const toggleAddSurveyModal = useCallback(() => {
    setAddActive((prev) => !prev);
  }, []);

  const handleAddSurveyNext = useCallback(
    (choice) => {
      if (choice === "like-dislike") {
        router.push({
          pathname: "/surveys/add",
          query: {
            type: "like-or-dislike",
          },
        });
        return;
      }
      if (choice === "multiple-choice") {
        router.push({
          pathname: "/surveys/add",
          query: {
            type: "multiple-choice",
          },
        });
        return;
      }
    },
    [router],
  );

  return (
    <Page
      title="Surveys"
      primaryAction={
        <Button variant="primary" onClick={toggleAddSurveyModal} disabled={appPlanCode === "free"}>
          Add survey
        </Button>
      }
    >
      <ModuleControl
        jwt={jwt}
        moduleName="Online Survey"
        moduleCode="sv"
        onToggleToast={handleToggleToast}
        onToastMessage={handleToastMessage}
        currentPlan={appPlanCode}
        needRestrict={true}
      />
      <br />
      <SurveyTable
        jwt={jwt}
        onToggleToast={handleToggleToast}
        onToastMessage={handleToastMessage}
        appPlanCode={appPlanCode}
      />

      {/* Add survey modal */}
      <AddSurveyModal
        active={addActive}
        onClose={toggleAddSurveyModal}
        onCancel={toggleAddSurveyModal}
        onNext={handleAddSurveyNext}
      />

      {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
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
