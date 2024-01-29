import { ActionList, Card, Icon, Popover, Text, Tooltip } from "@shopify/polaris";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import styles from "./SingleLineChart.module.css";
import { DropdownMinor } from "@shopify/polaris-icons";

const LineChart = dynamic(() => import("@shopify/polaris-viz").then((mod) => mod.LineChart), {
  ssr: false,
});

export function SingleLineChart({ title, name, data, state, total, options, onChangeOption }) {
  const convertOptions = useMemo(() => {
    if (options?.length < 0) return [];
    return options.map(({ title, value }) => ({
      content: title,
      onAction: () => onChangeOption?.(value),
    }));
  }, [options, onChangeOption]);
  const [popoverActive, setPopoverActive] = useState(false);

  const formatLinearXAxisLabel = useCallback((value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  }, []);

  const titleFormatter = useCallback((value) => {
    return new Date(value).toLocaleDateString();
  }, []);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activeOption = useMemo(
    () => options.find((item) => item.value === title),
    [title, options],
  );

  return (
    <Card>
      <div className={styles.msr_header}>
        <Popover
          active={popoverActive}
          autofocusTarget="first-node"
          activator={
            <div className={styles.heading} onClick={togglePopoverActive}>
              <Text variant="headingMd" as="h5">
                {activeOption?.title ?? title}
              </Text>
              {options?.length > 0 ? (
                <div className={styles.icon}>
                  <Icon source={DropdownMinor} />
                </div>
              ) : null}
              {activeOption?.tooltip ? (
                <Tooltip content={activeOption?.tooltip?.content}>
                  {activeOption?.tooltip?.child}
                </Tooltip>
              ) : null}
            </div>
          }
          onClose={togglePopoverActive}
        >
          {options?.length > 0 ? <ActionList actionRole="menuitem" items={convertOptions} /> : null}
        </Popover>
        <Text variant="headingLg" as="h5">
          {total}
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
  options: [],
};
