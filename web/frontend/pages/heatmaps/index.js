import("isomorphic-fetch");
import { Page } from "@shopify/polaris";
import EmptyStateHeatMap from "components/Layout/EmptyStateHeatMap";
import PageTable from "components/PageTable";
import { useSelector } from "react-redux";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { selectShop } from "redux/reducers/general.reducer";
import { wrapper } from "redux/store";

export default function HeatMapList({ jwt }) {
  const { appPlanCode } = useSelector(selectShop);

  return (
    <>
      {appPlanCode !== "free" ? (
        <div className="hm_page">
          <Page title="Heatmaps" fullWidth>
            <PageTable jwt={jwt} />
          </Page>
        </div>
      ) : (
        <Page fullWidth>
          <EmptyStateHeatMap />
        </Page>
      )}
    </>
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
