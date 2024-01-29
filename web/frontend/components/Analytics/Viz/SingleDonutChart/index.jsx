import { Card, Text } from "@shopify/polaris";
import dynamic from "next/dynamic";
import { useCallback } from "react";

const DonutChart = dynamic(() => import("@shopify/polaris-viz").then((mod) => mod.DonutChart), {
  ssr: false,
});

export function SingleDonutChart({ title, data = [], state }) {
  const handleRenderInnerContent = useCallback(({ activeValue, totalValue }) => {
    if (!activeValue) {
      return totalValue;
    }

    const percentage = Math.round((activeValue / totalValue) * 100);

    return (
      <>
        <Text fontWeight="semibold">{activeValue}</Text>
        <Text variant="bodySm" tone="subdued">
          {percentage}%
        </Text>
      </>
    );
  }, []);

  return (
    <Card>
      <Text variant="headingMd" as="h5">
        {title}
      </Text>

      <div style={{ marginTop: "14px", height: "264px" }}>
        <DonutChart
          data={data}
          state={state}
          theme="Light"
          legendPosition="bottom"
          renderInnerValueContent={handleRenderInnerContent}
        />
      </div>
    </Card>
  );
}
