import { ActionList, Button, Icon, Popover } from "@shopify/polaris";
import { DesktopMajor, MobileMajor, TabletMajor, TickSmallMinor } from "@shopify/polaris-icons";
import { HEATMAP_DEVICE } from "consts/Heatmap.const";
import { useCallback, useState } from "react";

const { DESKTOP, TABLET, MOBILE } = HEATMAP_DEVICE;
export default function HeatmapDevice({ heatmapDevice, onHeatmapDeviceChange }) {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <div className="hm_filter_btn">
      <Button size="micro" onClick={togglePopoverActive} disclosure>
        {heatmapDevice === DESKTOP && <Icon source={DesktopMajor} />}
        {heatmapDevice === TABLET && <Icon source={TabletMajor} />}
        {heatmapDevice === MOBILE && <Icon source={MobileMajor} />}
        {heatmapDevice}
      </Button>
    </div>
  );

  const changeHeatmapDevice = useCallback(
    (device) => {
      if (device !== heatmapDevice) {
        onHeatmapDeviceChange(device);
      }
      togglePopoverActive();
    },
    [heatmapDevice],
  );

  return (
    <div>
      <Popover
        active={popoverActive}
        activator={activator}
        autofocusTarget="first-node"
        onClose={togglePopoverActive}
      >
        <ActionList
          actionRole="menuitem"
          items={[
            {
              content: DESKTOP,
              icon: DesktopMajor,
              onAction: () => changeHeatmapDevice(DESKTOP),
              active: heatmapDevice === DESKTOP,
              suffix: heatmapDevice === DESKTOP ? <Icon source={TickSmallMinor} /> : <></>,
            },
            {
              content: TABLET,
              icon: TabletMajor,
              onAction: () => changeHeatmapDevice(TABLET),
              active: heatmapDevice === TABLET,
              suffix: heatmapDevice === TABLET ? <Icon source={TickSmallMinor} /> : <></>,
            },
            {
              content: MOBILE,
              icon: MobileMajor,
              onAction: () => changeHeatmapDevice(MOBILE),
              active: heatmapDevice === MOBILE,
              suffix: heatmapDevice === MOBILE ? <Icon source={TickSmallMinor} /> : <></>,
            },
          ]}
        />
      </Popover>
    </div>
  );
}
