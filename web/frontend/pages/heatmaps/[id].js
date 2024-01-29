import("isomorphic-fetch");
import { Page } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { wrapper } from "redux/store";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import HeatMapFrame from "components/Heatmap";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import { useRouter } from "next/router";

export default function HeatMap({ jwt }) {
  const { myshopifyDomain, appPlanCode } = useSelector(selectShop);

  const router = useRouter();

  useEffect(() => {
    if (appPlanCode == "free") {
      router.push("/heatmaps");
    }
  }, []);

  const [pageTitle, setPageTitle] = useState("");
  return (
    <React.Fragment>
      <Page
        fullWidth
        title={pageTitle}
        backAction={{
          content: "Heatmap",
          onAction: () => router.push("/heatmaps"),
        }}
        breadcrumbs={[{ content: "Heatmaps", url: "/heatmaps" }]}
      >
        <HeatMapFrame jwt={jwt} setPageTitle={setPageTitle} domain={myshopifyDomain} />
      </Page>
    </React.Fragment>
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
