import { ActionList, Button, Icon, Popover } from "@shopify/polaris";
import { ButtonMinor, ResetMinor, SortMinor, TickSmallMinor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";

export default function HeatmapType({ heatmapType, onHeatmapTypeChange }) {
  const [popoverHMTypeActive, setPopoverHMTypeActive] = useState(false);

  const togglePopoverHMTypeActive = useCallback(
    () => setPopoverHMTypeActive((popoverHMTypeActive) => !popoverHMTypeActive),
    [],
  );

  const activatorHeatmapType = (
    <div className="hm_filter_btn">
      <Button size="micro" onClick={togglePopoverHMTypeActive} disclosure>
        {heatmapType === "Click" && <Icon source={ButtonMinor} />}
        {heatmapType === "Move" && <Icon source={ResetMinor} />}
        {heatmapType === "Scroll" && <Icon source={SortMinor} />}
        {heatmapType}s
      </Button>
    </div>
  );

  return (
    <Popover
      active={popoverHMTypeActive}
      activator={activatorHeatmapType}
      onClose={togglePopoverHMTypeActive}
    >
      <ActionList
        actionRole="menuitem"
        onActionAnyItem={() => setPopoverHMTypeActive(false)}
        items={[
          {
            content: "Clicks",
            icon: ButtonMinor,
            onAction: () => {
              heatmapType !== "Click" && onHeatmapTypeChange("Click");
            },
            active: heatmapType === "Click",
            suffix: heatmapType === "Click" ? <Icon source={TickSmallMinor} /> : <></>,
          },
          {
            content: "Moves",
            icon: ResetMinor,
            onAction: () => {
              heatmapType !== "Move" && onHeatmapTypeChange("Move");
            },
            active: heatmapType === "Move",
            suffix: heatmapType === "Move" ? <Icon source={TickSmallMinor} /> : <></>,
          },
          {
            content: "Scrolls",
            icon: SortMinor,
            onAction: () => {
              heatmapType !== "Scroll" && onHeatmapTypeChange("Scroll");
            },
            active: heatmapType === "Scroll",
            suffix: heatmapType === "Scroll" ? <Icon source={TickSmallMinor} /> : <></>,
          },
        ]}
      />
    </Popover>
  );
}
