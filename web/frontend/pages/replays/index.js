import("isomorphic-fetch");
import { Banner, Button, Page } from "@shopify/polaris";
import SessionTable from "components/SessionTable";
import { useRouter } from "next/router";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";
import { selectShop } from "redux/reducers/general.reducer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RECORDING_NOTI_OPTIONS } from "consts/RecordingNoti.const";

export default function Replays({ jwt }) {
  const router = useRouter();
  const { countTotalSession } = useSelector(selectShop);

  const handleCrisp = (totalSession) => {
    let messageText = "";
    if (totalSession == 1 && !localStorage.getItem("show_crisp_first_recording")) {
      messageText = RECORDING_NOTI_OPTIONS.FIRST_RECORDINGS_MESSAGE;
      localStorage.setItem("show_crisp_first_recording", true);
      window.$crisp.push(["do", "chat:open"]);
      window.$crisp.push(["do", "message:show", ["text", messageText]]);
    } else if (totalSession == 10 && !localStorage.getItem("show_crisp_ten_first_recordings")) {
      messageText = RECORDING_NOTI_OPTIONS.TENTH_FIRST_RECORDINGS_MESSAGE1;
      window.$crisp.push(["do", "message:show", ["text", messageText]]);
      messageText = RECORDING_NOTI_OPTIONS.TENTH_FIRST_RECORDINGS_MESSAGE2;
      localStorage.setItem("show_crisp_ten_first_recordings", true);
      window.$crisp.push(["do", "chat:open"]);
      window.$crisp.push(["do", "message:show", ["text", messageText]]);
    }
  };
  useEffect(() => {
    if (typeof window.$crisp !== "undefined" && window.$crisp) {
      if (countTotalSession != 1 && countTotalSession != 10) {
        window.$crisp.push(["do", "chat:close"]);
        return;
      }
      if (countTotalSession > 0) {
        handleCrisp(countTotalSession);
      }
    }
  }, [countTotalSession]);

  return (
    <Page title="Session Replays" fullWidth={true}>
      <div className={"new_feature_banner"} data-page={"replays"}>
        <Banner>
          <div className={"new_feature_banner__wrapper"}>
            <div className={"new_feature_banner__content"}>
              <p>
                To collect/filter recordings by customer email, please go to{" "}
                <strong>Session settings</strong> for more details.
              </p>
            </div>
            <div className={"new_feature_banner__button"}>
              <Button variant="primary" onClick={() => router.push("/settings")}>
                Session settings
              </Button>
            </div>
          </div>
        </Banner>
        <Banner title="INFORMATION" tone="warning">
          <div className={"new_feature_banner__wrapper"}>
            <div className={"new_feature_banner__content"}>
              <p>
                Dear FREE merchants, your recordings will be stored in our app within one month. At
                the beginning of the month, we&#39;ll delete recordings from two months back.
                However, the data analytics won&#39;t be deleted!
              </p>
            </div>
          </div>
        </Banner>
      </div>
      <br />
      <SessionTable jwt={jwt} />
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
