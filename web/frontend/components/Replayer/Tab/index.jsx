import { LegacyCard, LegacyTabs } from "@shopify/polaris";
import SystemInformation from "components/SystemInformation";
import VisitorInformation from "components/VisitorInformation";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import BehaviorItem from "../BehaviorItem";
import styles from "../Replayer.module.css";

export default function ReplayerTabs({
  session,
  list,
  index,
  player,
  timesStartOfPageview,
  startTime,
  setIndex,
  sessionTags,
  setSessionTags,
}) {
  const { myshopifyDomain } = useSelector(selectShop);

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const visitorLastActive = useMemo(() => {
    if (session?.visitor?.updatedAt) {
      const visitorDate = new Date(session.visitor.updatedAt);
      return `${visitorDate.toLocaleDateString()} ${visitorDate.toLocaleTimeString()}`;
    } else {
      return "";
    }
  }, [session]);
  const sessionDate = useMemo(() => {
    if (session?.createdAt) {
      const sessionDate = new Date(session.createdAt);
      return `${sessionDate.toLocaleDateString()} ${sessionDate.toLocaleTimeString()}`;
    } else {
      return "";
    }
  }, [session]);

  const informationTab = useMemo(() => {
    return (
      <div>
        <VisitorInformation
          visitorID={session.visitor._id}
          customerId={session.customer_id}
          myshopifyDomain={myshopifyDomain}
          customerEmail={session.customer_email}
          visitorLastActive={visitorLastActive}
        />
        <SystemInformation
          title="Pageview Information"
          createdDate={sessionDate}
          deviceLocation={session.location}
          deviceAddress={session.address}
          deviceOS={session.os}
          deviceBrowser={session.browser}
          deviceType={session.device}
          sessionIp={session.ip}
          duration={session.duration}
          sessionTags={sessionTags}
        />
      </div>
    );
  }, [session, myshopifyDomain]);

  const timelineTab = useMemo(() => {
    return (
      <div className={`${styles.msr_timeline__body} msr_timeline_container`}>
        {list.length > 0 && (
          <div className={styles.msr_timeline__list}>
            {list.map((view, viewIdx) => {
              let start_time;
              if (view.start_time) {
                start_time = view.start_time;
              } else if (view.events && view.events.length > 0) {
                start_time = view.events[0].timestamp;
              } else {
                return 0;
              }
              let url = new URL(view.href).pathname;
              url = url === "/" ? "Homepage" : url;
              return (
                <div key={`page_view__${viewIdx}`} className={`page_view__${viewIdx}`}>
                  <div
                    className={styles.msr_timeline__page_view}
                    viewed={(viewIdx === index).toString()}
                    onClick={() => handleTimelineClick(start_time)}
                  >
                    <div
                      className={styles.msr_timeline__list_item}
                      key={`behavior__page_view`}
                      viewed={(viewIdx <= index).toString()}
                    >
                      <BehaviorItem view={url} />
                    </div>
                    {view.behaviors.map((behavior, behaviorIdx) => (
                      <div
                        className={styles.msr_timeline__list_item}
                        key={`behavior__${behaviorIdx}`}
                        viewed={(viewIdx <= index).toString()}
                      >
                        <BehaviorItem behavior={behavior} />
                      </div>
                    ))}
                  </div>
                  <div className={styles.msr_timeline__line}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }, [index, list, handleTimelineClick]);

  const tabs = useMemo(() => {
    return [
      {
        id: 1,
        content: "Timeline",
        panelID: 1,
        children: timelineTab,
      },
      {
        id: 2,
        content: "Information",
        panelID: 2,
        children: informationTab,
      },
    ];
  }, [timelineTab, informationTab]);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelectedTabIndex(selectedTabIndex),
    [],
  );

  const handleTimelineClick = useCallback(
    (currentTime) => {
      let goToTime = currentTime - startTime;
      player.goto(goToTime);
      let indexPage = timesStartOfPageview.findIndex((i) => i === parseInt(currentTime));
      setIndex(indexPage);
    },
    [player, timesStartOfPageview, startTime, setIndex],
  );

  return (
    <LegacyCard>
      <LegacyTabs tabs={tabs} selected={selectedTabIndex} onSelect={handleTabChange} fitted>
        <LegacyCard.Section>{tabs[selectedTabIndex].children}</LegacyCard.Section>
      </LegacyTabs>
    </LegacyCard>
  );
}
