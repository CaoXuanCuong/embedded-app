import { Card, Grid, Text } from "@shopify/polaris";
import dynamic from "next/dynamic";
import styles from "./OrderFunnel.module.css";

const FunnelChart = dynamic(() => import("@shopify/polaris-viz").then((mod) => mod.FunnelChart), {
  ssr: false,
});

export function OrderFunnel({ title, data, state }) {
  return (
    <Card>
      <Text variant="headingMd" as="h5">
        {title}
      </Text>

      <div className={styles.container}>
        <Grid gap={{ xl: "24px" }}>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
            <FunnelChart data={data} theme="Light" state={state} />
          </Grid.Cell>

          {/* <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}>
                          {state === 'Success' &&
                              <div className={styles.completion}>
                                  <Text variant="headingXl" as="h4" alignment="end">25%</Text>
                                  <Text variant="bodySm" color="subdued" alignment="end">Completion</Text>
                              </div>
                          }
                      </Grid.Cell> */}
        </Grid>
      </div>
    </Card>
  );
}

OrderFunnel.defaultProps = {
  data: [
    {
      name: "Empty",
      data: [],
    },
  ],
};
