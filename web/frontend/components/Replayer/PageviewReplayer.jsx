import rrwebPlayer from "@bss-sbc/rrweb-player";
import DeleteModal from "components/DeleteModal";
import PageViewEndReplayModal from "components/EndReplayModal/PageviewEndReplayModal";
import { HIDDEN_CONTENT_PAGEVIEW } from "consts/HiddenContent.const";
import LocalStorageConst from "consts/LocalStorage.const";
import PlayerConst from "consts/Player.const";
import { renderButtonControlInPlayer } from "helpers/replayer.helper";
import { generateSupportCssNode } from "helpers/support/css";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import "rrweb-player/dist/style.css";
import { deletePageview } from "services/pageview.service";
import styles from "./Replayer.module.css";
import PageviewReplayerTab from "./Tab/PageviewReplayerTab";

function parseHTML(html) {
  const node = document.createElement("template");
  node.innerHTML = html;
  return node.content;
}

function PageviewReplayer({
  list,
  autoPlay,
  speed,
  jwt,
  changeIndexReplay,
  pageViewPagination,
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
  setPageviewTags,
  setToastMessage,
  handleToggleToast,
}) {
  const router = useRouter();
  const { id } = router.query;

  const [autoNext, setAutoNext] = useState(() => {
    const autoNextSession = JSON.parse(localStorage.getItem(LocalStorageConst.AUTO_NEXT)) || "";
    return autoNextSession ? autoNextSession : false;
  });

  const handleAutoNext = useCallback((status) => {
    setAutoNext(status);
    localStorage.setItem(LocalStorageConst.AUTO_NEXT, JSON.stringify(status));
  }, []);

  const speedOptions = useMemo(() => {
    return PlayerConst.speedOptions;
  }, []);

  const tooltipText = useMemo(() => {
    if (autoNext) {
      return "Autoplay is on";
    } else {
      return "Autoplay is off";
    }
  }, [autoNext]);

  const [index, setIndex] = useState(0);
  const [href, setHref] = useState({});
  const [isShowModal, setIsShowModal] = useState(false);
  const [isReplay, setIsReplay] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hiddenCheckout = useRef({
    index: null,
    hidden: null,
  });

  const clearRRPlayer = useCallback(() => {
    let rrPlayer = document.querySelector(
      "#AppFrameMain > .Polaris-Frame__Content .msr_player__rrweb .rr-player",
    );
    if (rrPlayer) {
      hiddenCheckout.current.hidden = false;
      rrPlayer.remove();
    }
  }, []);

  const renderPlayer = useCallback(
    (events) => {
      // insert node for css support
      if (events && events.length > 1 && events[1].type === 2) {
        const targetNodes = events[1]?.data?.node?.childNodes[1]?.childNodes;
        if (targetNodes && targetNodes?.length) {
          const hasPush = targetNodes.findIndex((dataNode) => dataNode?.midaCustomizeNode === true);
          if (hasPush === -1) {
            const supportCssNode = generateSupportCssNode(myshopifyDomain);
            events[1]?.data?.node.childNodes[1].childNodes.unshift(supportCssNode);
          }
        }
      }
      if (autoPlay !== null && speed !== null) {
        clearRRPlayer();
        try {
          const player = new rrwebPlayer({
            target: document.querySelector("#pageview-container .msr_player__rrweb"),
            props: {
              autoPlay: autoPlay,
              speed: speed,
              events: events.map((item) => {
                if (item.data === undefined) {
                  item.data = {};
                }
                return item;
              }),
            },
          });
          const replayer = player.getReplayer();

          const playerContainer = document.querySelector(
            "#__next #pageview-container .msr_player__rrweb",
          );
          const controlBar = playerContainer.querySelector(".rr-controller__btns");

          renderButtonControlInPlayer({
            player,
            replayer,
            controlBar,
            sessions: pageViewPagination,
            id,
            router,
            path: "pageviews",
          });

          replayer.on("finish", function () {
            if (autoPlay) {
              setIndex((prev) => (prev < list.length - 1 ? prev + 1 : prev));
            }
            if (index === list.length - 1) {
              setIsShowModal(true);
            }
          });
          const rrPlayerFrame = document.querySelector(
            ".msr_player__rrweb .rr-player .rr-player__frame",
          );
          if (rrPlayerFrame) {
            rrPlayerFrame.append(parseHTML(HIDDEN_CONTENT_PAGEVIEW));
          }
          replayer.on("event-cast", (event) => {
            if (
              event.type !== 6 &&
              event.data &&
              event.data.plugin !== "msr/checkout" &&
              hiddenCheckout.current.hidden &&
              hiddenCheckout.current.hidden > event.timestamp
            ) {
              if (rrPlayerFrame) {
                hiddenCheckout.current.hidden = null;
                const rrPlayerWrapper = rrPlayerFrame.querySelector(".replayer-wrapper");
                if (rrPlayerWrapper) {
                  rrPlayerWrapper.style.display = "block";
                }
                const hiddenCheckoutContent = rrPlayerFrame.querySelector(".msr_hidden_content");
                if (hiddenCheckoutContent) {
                  hiddenCheckoutContent.style.display = "none";
                }
              }
            }
            if (
              !hiddenCheckout.current.hidden &&
              event.type === 6 &&
              event.data &&
              event.data.plugin === "msr/checkout"
            ) {
              if (rrPlayerFrame) {
                hiddenCheckout.current.hidden = event.timestamp;
                const rrPlayerWrapper = rrPlayerFrame.querySelector(".replayer-wrapper");
                if (rrPlayerWrapper) {
                  rrPlayerWrapper.style.display = "none";
                }
                const hiddenCheckoutContent = rrPlayerFrame.querySelector(".msr_hidden_content");
                if (hiddenCheckoutContent) {
                  hiddenCheckoutContent.style.display = "flex";
                }
              }
            }
          });
          const replayerWrapper = replayer.wrapper.closest(".rr-player");
          const initiatedSpeed = replayerWrapper.querySelector(
            ".rr-controller__btns button:nth-child(2)",
          );
          const configuredSpeed = replayerWrapper.querySelector(
            `.rr-controller__btns button:nth-child(${speedOptions[speed.toString()]})`,
          );
          if (initiatedSpeed && configuredSpeed) {
            initiatedSpeed.classList.remove("active");
            configuredSpeed.classList.add("active");
          }
        } catch (e) {
          console.log("ERROR", e.message);
          clearRRPlayer();
        }
      }
    },
    [clearRRPlayer, speedOptions, autoPlay, speed, list, index, id, pageViewPagination, router],
  );

  const handleToggleDeleteModal = useCallback(() => {
    if (!deleteLoading) setDeleteModalActive((prev) => !prev);
  }, [deleteLoading]);

  const handleDeletePageView = useCallback(async () => {
    setDeleteLoading(true);
    const result = await deletePageview(deleteId, jwt);
    setToastMessage(result.message);
    handleToggleToast();
    setDeleteLoading(false);
    handleToggleDeleteModal();
    setTimeout(() => {
      router.push("/pageviews");
    }, 500);
  }, [jwt, deleteId, handleToggleDeleteModal, handleToggleToast, router, setToastMessage]);

  useEffect(() => {
    const delay = setTimeout(function () {
      if (list.length > 0) {
        renderPlayer(list[index].events);
        setHref(new URL(list[index].href));
      }
    }, 1000);
    return () => clearTimeout(delay);
  }, [index, list, renderPlayer, isReplay]);

  useEffect(() => {
    setIsShowModal(false);
    setIndex(0);
    setIsReplay((prev) => !prev);
  }, [changeIndexReplay]);

  return (
    <>
      <div className={`${styles.msr_replayer} ${styles.msr_replayer__pageview}`}>
        <div className={styles.msr_player__full}>
          <div className="msr_player__rrweb"></div>
          {isShowModal && (
            <PageViewEndReplayModal
              id={id}
              router={router}
              setDeleteId={setDeleteId}
              isShowModal={isShowModal}
              setIsShowModal={setIsShowModal}
              setIndex={setIndex}
              setDeleteModalActive={setDeleteModalActive}
              type="pageview"
              setIsReplay={setIsReplay}
              pageviews={pageViewPagination}
            />
          )}
        </div>
        <div className={styles.msr_right_sidebar}>
          <PageviewReplayerTab
            createdDate={createdDate}
            deviceLocation={deviceLocation}
            deviceOS={deviceOS}
            deviceBrowser={deviceBrowser}
            deviceType={deviceType}
            sessionIp={sessionIp}
            duration={duration}
            visitorID={visitorID}
            customerId={customerId}
            myshopifyDomain={myshopifyDomain}
            customerEmail={customerEmail}
            visitorLastActive={visitorLastActive}
            pageviewTags={pageviewTags}
            setPageviewTags={setPageviewTags}
          />
        </div>
        <DeleteModal
          resource={"pageview"}
          resourceId={deleteId}
          active={deleteModalActive}
          onClose={handleToggleDeleteModal}
          loading={deleteLoading}
          onAction={handleDeletePageView}
        />
      </div>
    </>
  );
}

function areEqual(prevProps, nextProps) {
  const prevList = prevProps.list;
  const nextList = nextProps.list;
  return (
    prevList.length === nextList.length &&
    prevProps.autoPlay === nextProps.autoPlay &&
    prevProps.speed === nextProps.speed &&
    prevProps.changeIndexReplay === nextProps.changeIndexReplay &&
    prevProps.pageviewTags === nextProps.pageviewTags
  );
}

export default memo(PageviewReplayer, areEqual);
