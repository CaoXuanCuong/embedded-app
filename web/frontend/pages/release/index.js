import("isomorphic-fetch");
import { Page, LegacyCard } from "@shopify/polaris";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";
import styles from "./Release.module.css";
export default function Release({ jwt, releaseNotesRes }) {
  const releaseNotes = releaseNotesRes.data;
  return (
    <Page title="Release Notes" fullWidth>
      <div className={styles.card_wrapper}>
        <LegacyCard>
          <div className={styles.feature_wrapper}>
            <div dangerouslySetInnerHTML={{ __html: releaseNotes }} />
          </div>
        </LegacyCard>
      </div>
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
  const releaseNotesReq = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/releases`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
  });
  const releaseNotesRes = await releaseNotesReq.json();
  return {
    props: {
      jwt,
      releaseNotesRes,
    },
  };
});
