import("isomorphic-fetch");
import { useCallback, useEffect, useRef, useState } from "react";
import { rebuild } from "rrweb-snapshot";
import styles from "./Heatmap.module.css";

import { Banner, Text } from "@shopify/polaris";
import HeatmapAction from "components/Heatmap/HeatmapAction";
import FetchingPage from "components/Skeleton/FetchingPage";
import { HEATMAP_DEVICE, HEATMAP_VIEW_PORT, SUPPORT_SHOW_ELEMENTS } from "consts/Heatmap.const";
import {
  clearHeatmapBuilt,
  displayHeatmap,
  displayScrollmap,
  renderBackgroundOverlay,
  resizeContainer,
} from "helpers/heatmap.helper";
import { generateSupportCss } from "helpers/support/heatmap/css";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import { findHeatmap, findPage } from "services/heatmap.service";

export default function HeatMapFrame({ jwt, domain, setPageTitle }) {
  const router = useRouter();
  const { myshopifyDomain } = useSelector(selectShop);
  const { id, type = "Click", device = "Desktop", sd = "", ed = "", dT = "" } = router.query;
  const [pageInfo, setPageInfo] = useState({
    viewportWidth: 0,
    viewportHeight: 0,
    url: "",
    pageView: "",
  });
  const [viewportSnapshot, setViewportSnapshot] = useState(() => {
    const upperCaseDevice = device.toUpperCase();
    return {
      width: HEATMAP_VIEW_PORT[upperCaseDevice].WIDTH,
      height: HEATMAP_VIEW_PORT[upperCaseDevice].HEIGHT,
    };
  });

  const [snapshot, setSnapshot] = useState(null);
  const [fetchingPage, setFetchingPage] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [fetchingHeatmap, setFetchingHeatmap] = useState(true);
  const [hasBuiltPage, setHasBuiltPage] = useState(false);
  const [hasBuiltHm, setHasBuiltHm] = useState(false);
  const [heatmapType, setHeatmapType] = useState(type);
  const [heatmapDevice, setHeatmapDevice] = useState(device);
  const [stopBuildBackground, setStopBuildBackground] = useState(false);
  const controller = useRef(null);

  const fetchPageData = useCallback(async () => {
    setFetchingPage(true);
    try {
      const { ok, data } = await findPage(id, jwt, domain, heatmapDevice);
      if (ok && data) {
        if (data && data.statusCode === 200) {
          const { width, height, address, title, pageView } = data.payload;
          setSnapshot(data.payload.data);
          setPageInfo({
            viewportWidth: width,
            viewportHeight: height,
            url: address,
            pageView,
          });
          setStopBuildBackground(false);
          setPageTitle(title);
        } else {
          setStopBuildBackground(true);
        }
      }
    } catch (e) {
      // TODO: error handling
    }
    setFetchingPage(false);
  }, [id, jwt, domain, setPageTitle, heatmapDevice]);

  const fetchHeatmapData = useCallback(
    async (type) => {
      if (stopBuildBackground) return;
      if (!fetchingPage) {
        setFetchingHeatmap(true);
        try {
          const { ok, data } = await findHeatmap({
            id,
            jwt,
            type,
            pageView: pageInfo.pageView,
            domain,
            device: heatmapDevice,
            width: pageInfo.viewportWidth,
            height: pageInfo.viewportHeight,
            controller,
            startDate: sd,
            endDate: ed,
            dT,
          });

          if (ok && data) {
            setHeatmapData(data.payload);
          }
        } catch (e) {
          // TODO: error handling
        }
        setFetchingHeatmap(false);
      }
    },
    [id, jwt, fetchingPage, pageInfo, domain, stopBuildBackground],
  );

  const handleHeatmapTypeChange = useCallback((value) => {
    const iframe = document.querySelector(`.${styles.hm_iframe}`);
    iframe && clearHeatmapBuilt(iframe);
    if (controller.current) {
      controller.current.abort("Cancel previous request!");
      setHeatmapData([]);
    }
    setHeatmapType(value);
    setFetchingHeatmap(true);
  }, []);

  const handleHeatmapDeviceChange = useCallback((value) => {
    const iframe = document.querySelector(`.${styles.hm_iframe}`);
    iframe && clearHeatmapBuilt(iframe);
    if (controller.current) {
      controller.current.abort("Cancel previous request!");
      setHeatmapData([]);
    }
    setHeatmapDevice(value);
    setFetchingHeatmap(true);
  }, []);

  const supportAnimation = useCallback(() => {
    const iframe = document.querySelector(`.${styles.hm_iframe}`);
    if (iframe) {
      const iframeDoc = iframe.contentWindow.document;
      if (iframeDoc) {
        iframeDoc
          .querySelectorAll(".animate--slide-in, .banner")
          .forEach((item) => (item.style.animation = "var(--animation-slide-in)"));
        iframeDoc
          .querySelectorAll(SUPPORT_SHOW_ELEMENTS.join(", "))
          .forEach((i) => (i.style.opacity = 1));
      }
    }
  }, []);

  const rebuildBackground = useCallback(() => {
    if (stopBuildBackground) {
      const iframe = document.querySelector(`.${styles.hm_iframe}`);
      if (iframe) {
        iframe.contentDocument.documentElement.display = "none";
        iframe.style.display = "none";
      }
    }
    if (!fetchingPage && snapshot) {
      setHasBuiltPage(false);
      const iframe = document.querySelector(`.${styles.hm_iframe}`);
      iframe.removeEventListener("scroll", scroll);
      const pageContent = document.querySelector(`.${styles.hm_page_content}`);
      const iframeContainer = document.querySelector(`.${styles.hm_iframe_container}`);

      rebuild(snapshot.node, {
        doc: iframe.contentDocument,
        hackCss: true,
        cache: { stylesWithHoverClass: new Map() },
        afterAppend: (node, id) => {
          if (node.tagName == "use") {
            const hrefAttribute = node.attributes.href;
            if (hrefAttribute && hrefAttribute.value.includes("#icon-search")) {
              hrefAttribute.value = "#icon-search";
            }
          }
        },
      });
      const iframeDocument = iframe.contentDocument.documentElement;
      generateSupportCss({ domain: myshopifyDomain, iframeDocument });
      const allElements = iframeDocument.querySelectorAll("*");
      const styleElement = document.createElement("style");
      styleElement.setAttribute("type", "text/css");
      styleElement.textContent = `
        *::before, *::after {
          pointer-events: none !important;
        }
      `;
      iframeDocument.appendChild(styleElement);
      allElements.forEach((element) => {
        if (element) {
          const position = window.getComputedStyle(element).getPropertyValue("position");
          if (position && (position === "fixed" || position === "sticky")) {
            if (
              typeof element.className === "string" &&
              element?.className?.includes("Mida-Survey--root")
            ) {
              let iframe = document.querySelector("#frame-heatmap");
              if (iframe) {
                let width = iframe.offsetWidth;
                width = parseFloat(width) * 0.64;
                element.style.position = "relative";
                element.style.right = `-${width}px`;
              }
            } else {
              element.style.position = "initial";
            }
          }
        }
      });
      supportAnimation();
      resizeContainer({
        pageContent,
        iframeContainer,
        height: viewportSnapshot.height,
        width: viewportSnapshot.width,
        heatmapDevice,
      });

      window.addEventListener("resize", () => {
        resizeContainer({
          pageContent,
          iframeContainer,
          height: viewportSnapshot.height,
          width: viewportSnapshot.width,
          heatmapDevice,
        });
      });

      setTimeout(() => {
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument.documentElement) return;
        renderBackgroundOverlay({ iframe });
        setHasBuiltPage(true);
      }, 500);
    }
  }, [fetchingPage, snapshot, pageInfo, heatmapDevice, stopBuildBackground]);

  const buildHeatmap = useCallback(() => {
    if (stopBuildBackground) {
      const iframe = document.querySelector(`.${styles.hm_iframe}`);
      if (iframe) {
        iframe.contentDocument.documentElement.display = "none";
        iframe.style.display = "none";
      }
      return;
    }
    if (!fetchingHeatmap && hasBuiltPage) {
      setHasBuiltHm(false);
      const iframe = document.querySelector(`.${styles.hm_iframe}`);
      const iframeDocument = iframe.contentDocument.documentElement;
      const msrHmOverlay = iframeDocument.querySelector("#msr_hm_overlay");
      const msrScrollmap = iframeDocument.querySelector("#msr_scrollmap");
      const msrHmContent = iframeDocument.querySelector("#msr_hm_content");
      const msrElementOverLay = iframeDocument.querySelector("#msr_element_overlay");

      iframe.style.pointerEvents = "all";
      iframeDocument.addEventListener("click", (e) => e.preventDefault());
      if (msrHmOverlay && ["Click", "Move"].includes(heatmapType)) {
        msrHmOverlay.style.display = "";
        msrElementOverLay.style.display = "";
        msrScrollmap.style.display = "none";
        displayHeatmap(iframeDocument, msrHmContent, msrElementOverLay, heatmapData, heatmapType);
      } else if (heatmapType === "Scroll") {
        msrHmOverlay.style.display = "none";
        msrElementOverLay.style.display = "none";
        msrScrollmap.style.display = "";
        displayScrollmap(msrScrollmap, heatmapData);
      }
      setHasBuiltHm(true);
    }
  }, [fetchingHeatmap, hasBuiltPage, heatmapData, heatmapType, stopBuildBackground]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    rebuildBackground();
  }, [rebuildBackground]);

  useEffect(() => {
    fetchHeatmapData(heatmapType);
  }, [fetchHeatmapData, heatmapType]);

  useEffect(() => {
    buildHeatmap();
    if (fetchingHeatmap && !stopBuildBackground) {
      return () => {
        const iframe = document.querySelector(`.${styles.hm_iframe}`);
        iframe && clearHeatmapBuilt(iframe);
      };
    }
  }, [buildHeatmap, fetchingHeatmap, stopBuildBackground]);

  useEffect(() => {
    switch (heatmapDevice) {
      case HEATMAP_DEVICE.DESKTOP:
        setViewportSnapshot({
          width: HEATMAP_VIEW_PORT.DESKTOP.WIDTH,
          height: HEATMAP_VIEW_PORT.DESKTOP.HEIGHT,
        });
        break;
      case HEATMAP_DEVICE.TABLET:
        setViewportSnapshot({
          width: HEATMAP_VIEW_PORT.TABLET.WIDTH,
          height: HEATMAP_VIEW_PORT.TABLET.HEIGHT,
        });
        break;
      case HEATMAP_DEVICE.MOBILE:
        setViewportSnapshot({
          width: HEATMAP_VIEW_PORT.MOBILE.WIDTH,
          height: HEATMAP_VIEW_PORT.MOBILE.HEIGHT,
        });
        break;
      default:
        console.log(`Invalid heatmap device!`);
        break;
    }
  }, [heatmapDevice]);

  return (
    <>
      {fetchingPage ? (
        <FetchingPage />
      ) : (
        <>
          <HeatmapAction
            jwt={jwt}
            id={id}
            domain={domain}
            currentURL={pageInfo.url}
            heatmapType={heatmapType}
            onHeatmapTypeChange={handleHeatmapTypeChange}
            heatmapDevice={heatmapDevice}
            onHeatmapDeviceChange={handleHeatmapDeviceChange}
          />

          <div className={styles.hm_page_content}>
            <div className={styles.hm_iframe_container}>
              {!hasBuiltHm && (
                <div className={styles.hm_loader_container}>
                  <div className={styles.hm_loader}></div>
                </div>
              )}
              <iframe
                id="frame-heatmap"
                width={viewportSnapshot.width}
                height={viewportSnapshot.height}
                className={styles.hm_iframe}
              ></iframe>
            </div>
          </div>
          {stopBuildBackground && (
            <Banner tone="warning">
              <Text as="h4" variant="headingMd" fontWeight="medium">
                Cannot found any sessions on {heatmapDevice}. Please choose another device to see
                Heatmaps.
              </Text>
            </Banner>
          )}
        </>
      )}
    </>
  );
}
