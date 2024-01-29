import Image from "next/image";
import heatmapPic from "../../public/images/heatmap/heatmap.svg";
import HeatmapActionPic from "../../public/images/heatmap/heatmap-action.svg";
import { Bleed, BlockStack, EmptyState, InlineStack, Text } from "@shopify/polaris";
import styles from "./EmptyStateHeatMap.module.css";
import { useRouter } from "next/router";
import { useCallback } from "react";
export default function EmptyStateHeatMap() {
  const router = useRouter();

  const handleUpgradeClick = useCallback(() => {
    router.push("/plans");
  }, []);

  return (
    <div className={styles.empty_heatmap}>
      <InlineStack align="center" blockAlign="center" gap="3200" wrap={false}>
        <BlockStack>
          <p style={{ color: "#5826de" }}>
            <Text fontWeight="medium">Heatmaps</Text>
          </p>
          <Bleed marginBlockStart={"300"}>
            <EmptyState
              heading={
                <div style={{ textAlign: "left" }}>
                  <Text as="h4" fontWeight="semibold" variant="heading2xl">
                    See what visitors find most interesting
                  </Text>
                </div>
              }
              action={{ content: "Upgrade now", onClick: handleUpgradeClick }}
              secondaryAction={{
                content: "Learn more",
                url: "https://docs-shpf.bsscommerce.com/mida-session-recording-replay/about-app/view-heatmaps",
                target: "_blank",
              }}
            >
              <div>
                <br />
                <BlockStack inlineAlign="start" gap="400">
                  <div className={styles.regular_text}>
                    <Text alignment="start" variant="bodyLg" fontWeight="regular" tone="subdued">
                      Improve any page of your site with confidence. See which parts of the page get
                      ignored and which elements drive sales and signups. Upgrade plan to use this
                      feature.
                    </Text>
                  </div>
                  <Image src={HeatmapActionPic} alt="Heat map action" />
                </BlockStack>
              </div>
            </EmptyState>
          </Bleed>
        </BlockStack>
        <Image src={heatmapPic} alt="Heat map empty" />
      </InlineStack>
    </div>
  );
}
