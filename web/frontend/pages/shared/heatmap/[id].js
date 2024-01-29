import("isomorphic-fetch");
import { Page } from "@shopify/polaris";
import HeatMapFrame from "components/Heatmap";
import LayoutShared from "components/Layout/LayoutShared";
import { useState } from "react";

export default function SharedHeatMap({ id, domain }) {
  const [pageTitle, setPageTitle] = useState("");
  return (
    <Page fullWidth title={pageTitle}>
      <HeatMapFrame jwt={null} id={id} domain={domain} setPageTitle={setPageTitle} />
    </Page>
  );
}

SharedHeatMap.getLayout = function getLayout(page) {
  return <LayoutShared>{page}</LayoutShared>;
};

export async function getServerSideProps({ _, __, query }) {
  const id = query.id;
  const domain = query.domain;
  return {
    props: {
      id,
      domain,
    },
  };
}
