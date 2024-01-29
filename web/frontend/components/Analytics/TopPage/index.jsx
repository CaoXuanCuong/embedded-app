import { Card, Text, BlockStack } from "@shopify/polaris";
import styles from "./TopPage.module.css";
import { useCallback } from "react";

export function TopPage({ title, pages, onClick }) {
  const handleItemClick = useCallback(
    (href) => {
      if (!onClick) return;
      onClick(href);
    },
    [onClick],
  );

  return (
    <div className="TopPage_container">
      <Card>
        <Text variant="headingMd" as="h5">
          {title}
        </Text>

        <div style={{ marginTop: "14px" }}></div>
        <BlockStack gap="2">
          {pages.map(({ href, views }, index) => (
            <div
              key={`top-page-${index}`}
              className={styles.page}
              onClick={() => handleItemClick(href)}
            >
              <div className={styles.rank}>
                <Text variant="headingXs">#{index + 1}</Text>
              </div>
              <div className={styles.content}>
                <Text truncate={true} fontWeight="semibold">
                  /{href.split("/").slice(3).join("/")}
                </Text>
              </div>
              <div className={styles.count}>
                <Text truncate={true} tone="subdued" alignment="end">
                  {views}
                </Text>
              </div>
            </div>
          ))}
        </BlockStack>
      </Card>
    </div>
  );
}

TopPage.defaultProps = {
  pages: [],
};
