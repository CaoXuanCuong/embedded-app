import { LegacyCard, Text } from "@shopify/polaris";
import FetchingData from "components/Skeleton/FetchingData";
import styles from "./NumberCard.module.css";

export default function NumberCard({ title, value, loading }) {
  return (
    <div className={styles.msr_analytics__pie_chart}>
      <LegacyCard
        sectioned
        title={
          title !== undefined && title !== null ? (
            <Text as="h3" fontWeight="semibold" tone="subdued">
              {title}
            </Text>
          ) : (
            ""
          )
        }
      >
        {loading ? (
          <FetchingData size={"small"} />
        ) : (
          <Text as="h1" fontWeight="semibold">
            {value}
          </Text>
        )}
      </LegacyCard>
    </div>
  );
}
