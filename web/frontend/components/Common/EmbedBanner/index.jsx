import { Banner, Text } from "@shopify/polaris";
import styles from "./EmbedBanner.module.css";

export function EmbedBanner({ active, loading, hideTitle, onEnable, onClose }) {
  if (!active) return null;
  return (
    <div className={styles.container}>
      <Banner
        title={hideTitle ? "" : ""}
        tone="warning"
        onDismiss={onClose}
        action={{ content: "Enable app", loading, onAction: onEnable }}
      >
        <Text as="p">
          <Text fontWeight="semibold" as="span">
            MIDA: Heatmap, Record & Replay{" "}
          </Text>
          <Text as="span">is not enabled in your live theme. Enable </Text>
          <Text fontWeight="semibold" as="span">
            MIDA: Heatmap, Record & Replay{" "}
          </Text>
          <Text as="span">in App embeds to embed the app to your theme.</Text>
        </Text>
      </Banner>
    </div>
  );
}
