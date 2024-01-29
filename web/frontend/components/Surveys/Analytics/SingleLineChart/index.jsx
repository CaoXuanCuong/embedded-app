import { Card, Text } from "@shopify/polaris";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import styles from "./SingleLineChart.module.css";

const LineChart = dynamic(() => import("@shopify/polaris-viz").then((mod) => mod.LineChart), {
  ssr: false,
});

export function SingleLineChart({ title, name, data, state }) {
  const formatLinearXAxisLabel = useCallback((value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  }, []);

  const titleFormatter = useCallback((value) => {
    return new Date(value).toLocaleDateString();
  }, []);

  return (
    <Card>
      <div className={styles.msr_header}>
        <Text variant="headingMd" as="h5">
          {title}
        </Text>
      </div>
      <LineChart
        data={[
          {
            name,
            data,
          },
        ]}
        xAxisOptions={{
          labelFormatter: formatLinearXAxisLabel,
        }}
        tooltipOptions={{
          titleFormatter: titleFormatter,
        }}
        theme="Light"
        emptyStateText="Empty"
        state={state}
      />
    </Card>
  );
}

SingleLineChart.defaultProps = {
  data: [],
};
