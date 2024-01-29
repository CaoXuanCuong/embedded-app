import { Button, InlineStack, Text, BlockStack } from "@shopify/polaris";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import styles from "./SingleDonutChart.module.css";

const DonutChart = dynamic(() => import("@shopify/polaris-viz").then((mod) => mod.DonutChart), {
  ssr: false,
});

export function SingleDonutChart({ title, text, subText, data, state, action, badge }) {
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
    <div className={styles.container}>
      <div className={styles.heading}>
        <BlockStack>
          <InlineStack gap="200" blockAlign="baseline" wrap={false}>
            <Text variant="headingMd" as="h5" breakWord>
              {title}
            </Text>

            {/* Badge */}
            <div className={styles.badge}>{badge}</div>
          </InlineStack>
          <Text breakWord>{text}</Text>
          <Text variant="bodySm" tone="subdued">
            {subText}
          </Text>
        </BlockStack>

        {action?.show ? (
          <Button variant="plain" onClick={action?.onClick}>
            {action?.label}
          </Button>
        ) : null}
      </div>

      <div className={styles.chart}>
        <DonutChart
          data={data}
          state={state}
          theme="Light"
          legendPosition="bottom"
          renderInnerValueContent={handleRenderInnerContent}
        />
      </div>
    </div>
  );
}

SingleDonutChart.defaultProps = {
  data: [],
};
