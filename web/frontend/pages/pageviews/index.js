import { Page } from "@shopify/polaris";
import PageViewTable from "components/PageView/Table";
import FetchingPage from "components/Skeleton/FetchingPage";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";

export default function PageViews({ jwt }) {
  const router = useRouter();
  const { query } = router;

  const [fetching, setFetching] = useState(true);
  const [hrefs, setHrefs] = useState([]);

  const fetchData = useCallback(async () => {
    const hrefsRes = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/url`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const hrefsJson = await hrefsRes.json();
    if (hrefsJson && (hrefsJson.statusCode === 200 || hrefsJson.statusCode === 404)) {
      setHrefs(hrefsJson.payload.uniqueHrefs);
    }
    setFetching(false);
  }, [jwt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Page title="Pageviews" fullWidth={true}>
      {fetching ? <FetchingPage /> : <PageViewTable jwt={jwt} hrefs={hrefs} searchquery={query} />}
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
