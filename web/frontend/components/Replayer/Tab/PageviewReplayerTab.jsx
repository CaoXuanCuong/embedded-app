import { LegacyCard, LegacyTabs } from "@shopify/polaris";
import SystemInformation from "components/SystemInformation";
import VisitorInformation from "components/VisitorInformation";
import { useCallback, useMemo, useState } from "react";

export default function PageviewReplayerTab({
  createdDate,
  deviceLocation,
  deviceOS,
  deviceBrowser,
  deviceType,
  sessionIp,
  duration,
  visitorID,
  customerId,
  myshopifyDomain,
  customerEmail,
  visitorLastActive,
  pageviewTags,
}) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const informationTab = useMemo(() => {
    return (
      <div>
        <VisitorInformation
          visitorID={visitorID}
          customerId={customerId}
          myshopifyDomain={myshopifyDomain}
          customerEmail={customerEmail}
          visitorLastActive={visitorLastActive}
        />
        <SystemInformation
          title="Pageview Information"
          createdDate={createdDate}
          deviceLocation={deviceLocation}
          deviceOS={deviceOS}
          deviceBrowser={deviceBrowser}
          deviceType={deviceType}
          sessionIp={sessionIp}
          duration={duration}
          pageviewTags={pageviewTags}
        />
      </div>
    );
  }, []);

  const tabs = useMemo(() => {
    return [
      {
        id: 1,
        content: "Information",
        panelID: 1,
        children: informationTab,
      },
    ];
  }, [informationTab]);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelectedTabIndex(selectedTabIndex),
    [],
  );

  return (
    <LegacyCard>
      <LegacyTabs tabs={tabs} selected={selectedTabIndex} onSelect={handleTabChange} fitted>
        <LegacyCard.Section>{tabs[selectedTabIndex].children}</LegacyCard.Section>
      </LegacyTabs>
    </LegacyCard>
  );
}
