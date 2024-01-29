import { Navigation } from "@shopify/polaris";
import {
  AnalyticsMajor,
  CashDollarMajor,
  CustomersMajor,
  HomeMajor,
  ReplayMinor,
  SettingsMajor,
  TemplateMajor,
  ChecklistAlternateMajor,
  ViewMinor,
  NoteMajor,
  QuestionMarkMajor,
  ComposeMajor,
} from "@shopify/polaris-icons";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import React, { useCallback, useEffect } from "react";
import Quota from "./Quota";

const LayoutNavigation = ({ onLoadingPage }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const goToPath = useCallback(
    (path) => {
      let rrPlayer = document.querySelector("#AppFrameMain > .Polaris-Frame__Content > .rr-player");
      if (rrPlayer) {
        rrPlayer.remove();
      }
      switch (path) {
        default:
          router.push(path);
      }
    },
    [router],
  );

  const isSelected = (path) => {
    const isRoot = path === "/";
    let result = false;
    if (isRoot) {
      result = router.pathname === path;
    } else {
      result = router.pathname.includes(path);
    }
    return result;
  };

  useEffect(() => {
    router.events.on("routeChangeStart", () => onLoadingPage(true));
    router.events.on("routeChangeComplete", () => onLoadingPage(false));
    const needRemoving = document.querySelector("body > main#AppFrameMain");
    if (needRemoving) {
      needRemoving.remove();
    }
  }, [router, dispatch]);

  return (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            icon: HomeMajor,
            onClick: () => goToPath("/"),
            selected: isSelected("/"),
          },
        ]}
      />
      <Navigation.Section
        separator={true}
        items={[
          {
            label: "Session Replays",
            icon: ReplayMinor,
            onClick: () => goToPath("/replays"),
            selected: isSelected("/replays"),
          },
          {
            label: "HeatMaps",
            icon: TemplateMajor,
            onClick: () => goToPath("/heatmaps"),
            selected: isSelected("/heatmaps"),
          },
          {
            label: "Pageviews",
            icon: ViewMinor,
            onClick: () => goToPath("/pageviews"),
            selected: isSelected("/pageviews"),
          },
          {
            label: "Visitors",
            icon: CustomersMajor,
            onClick: () => goToPath("/visitors"),
            selected: isSelected("/visitors"),
          },
          {
            label: "Surveys",
            icon: ChecklistAlternateMajor,
            onClick: () => goToPath("/surveys"),
            selected: isSelected("/surveys"),
          },
          {
            label: "Analytics",
            icon: AnalyticsMajor,
            onClick: () => goToPath("/analytics"),
            selected: isSelected("/analytics"),
          },
          {
            label: "Settings",
            icon: SettingsMajor,
            onClick: () => goToPath("/settings"),
            selected: isSelected("/settings"),
          },
        ]}
      />
      <Navigation.Section
        separator={true}
        items={[
          {
            label: "Pricing Plans",
            icon: CashDollarMajor,
            onClick: () => goToPath("/plans"),
            selected: isSelected("/plans"),
          },
          {
            label: "Feature requests",
            icon: ComposeMajor,
            onClick: () => goToPath("/feature-requests"),
            selected: isSelected("/feature-requests"),
          },
          {
            label: "Release Notes",
            icon: NoteMajor,
            onClick: () => goToPath("/release"),
            selected: isSelected("/release"),
          },
          {
            label: "User Guide",
            icon: QuestionMarkMajor,
            onClick: () =>
              window.open(
                "https://docs-shpf.bsscommerce.com/mida-session-recording-replay/",
                "_blank",
              ),
            selected: isSelected("/user-guide"),
          },
        ]}
      />
      <Navigation.Section
        title={"Visitor Quota"}
        separator={true}
        items={[
          {
            label: <Quota />,
          },
        ]}
      />
    </Navigation>
  );
};

export default LayoutNavigation;
