import { Button, InlineStack, TextField, Toast } from "@shopify/polaris";
import ShareURLModal from "components/Common/ShareURLModal";
import { useCallback, useState } from "react";
import HeatmapDevice from "./Device";
import styles from "./Heatmap.module.css";
import HeatmapType from "./Type";

export default function HeatmapAction({
  jwt,
  id,
  domain,
  currentURL,
  heatmapType,
  onHeatmapTypeChange,
  heatmapDevice,
  onHeatmapDeviceChange,
}) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);

  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handleToastMessage = (value) => {
    setToastMessage(value);
  };

  const handleCopyToClipboard = useCallback(() => {
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(currentURL);
    } else {
      document.execCommand("copy", true, currentURL);
    }
  }, [currentURL]);

  return (
    <>
      <InlineStack gap={300} align="space-between">
        <div className={styles.left_action}>
          {jwt && (
            <TextField
              value={currentURL}
              autoComplete="off"
              placeholder="URL"
              readOnly={true}
              connectedRight={
                <Button size="micro" onClick={handleCopyToClipboard}>
                  Copy
                </Button>
              }
            />
          )}
        </div>
        <InlineStack gap="200">
          <HeatmapDevice
            heatmapDevice={heatmapDevice}
            onHeatmapDeviceChange={onHeatmapDeviceChange}
          />
          <HeatmapType heatmapType={heatmapType} onHeatmapTypeChange={onHeatmapTypeChange} />

          {jwt && (
            <ShareURLModal
              name="heatmap"
              url={`https://${process.env.NEXT_PUBLIC_APP_URL}/shared/heatmap/${id}?domain=${domain}`}
              onToggleToast={handleToggleToast}
              onToastMessage={handleToastMessage}
            />
          )}
        </InlineStack>
      </InlineStack>
      <br />
      {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
    </>
  );
}
