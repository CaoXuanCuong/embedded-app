import rrwebPlayer from "@bss-sbc/rrweb-player";
import DeleteModal from "components/DeleteModal";
import EndReplayModal from "components/EndReplayModal";
import { HIDDEN_CONTENT_SESSION } from "consts/HiddenContent.const";
import PlayerConst from "consts/Player.const";
import {
  clearOverlaySkipInactive,
  handleProgressClick,
  renderButtonControlInPlayer,
  renderOverlaySkipInactive,
  renderSplitPageviewInPlayer,
} from "helpers/replayer.helper";
import { generateSupportCssNode } from "helpers/support/css";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import "rrweb-player/dist/style.css";
import { deleteSession } from "services/session.service";
import styles from "./Replayer.module.css";
import ReplayerTabs from "./Tab";
function parseHTML(html) {
  const node = document.createElement("template");
  node.innerHTML = html;
  return node.content;
}

function Replayer({
  session,
  list,
  speed,
  autoPlay,
  jwt,
  sessions,
  setToastMessage,
  handleToggleToast,
  changeIndexReplay,
  sessionTags,
  setSessionTags,
  setFullscreenHref,
  setDynamicIndex,
}) {
  const { myshopifyDomain } = useSelector(selectShop);
  const router = useRouter();
  const { id, visitor, pageview } = router.query;
  const allEvent = useMemo(
    function () {
      const fullEvent = list
        .map(
          (pageView) =>
            pageView?.events &&
            pageView.events.map((item) => {
              if (item.data === undefined) {
                item.data = {};
              }
              // insert node for css support
              const targetChildNodes = item?.data?.node?.childNodes[1]?.childNodes;
              if (item.type === 2 && targetChildNodes?.length > 0) {
                const hasPush = targetChildNodes?.findIndex(
                  (dataNode) => dataNode?.midaCustomizeNode === true,
                );

                if (hasPush === -1) {
                  const supportCssNode = generateSupportCssNode(myshopifyDomain);
                  item?.data?.node?.childNodes[1]?.childNodes?.unshift(supportCssNode);
                }
              }
              return item;
            }),
        )
        .flat();
      return fullEvent;
    },
    [list],
  );

  const timesStartOfPageview = useMemo(
    function () {
      return list.map((pageView) => {
        if (pageView.start_time) {
          return parseInt(pageView.start_time);
        } else if (pageView.events && pageView.events.length > 0) {
          return parseInt(pageView.events[0].timestamp);
        } else {
          return 0;
        }
      });
    },
    [list],
  );

  const startTime = useMemo(() => {
    if (list && list.length > 0) {
      if (list[0].start_time) {
        return parseInt(list[0].start_time);
      } else if (list[0].events && list[0].events.length > 0) {
        return parseInt(list[0].events[0].timestamp);
      }
    } else {
      return 0;
    }
  }, [list]);

  const endTime = useMemo(() => {
    if (list && list.length > 0) {
      if (list[list.length - 1].end_time) {
        return parseInt(list[list.length - 1].end_time);
      } else if (list[0].events && list[0].events.length) {
        let indexEndList = list.length - 1;
        let indexEndEventOfEndList = list[indexEndList].events.length - 1;
        let endTime = list[indexEndList].events[indexEndEventOfEndList]?.timestamp;
        if (!endTime || list[indexEndList].events.length === 0) {
          endTime = list[indexEndList].start_time;
        }
        return parseInt(endTime);
      }
    } else {
      return 0;
    }
  }, [list]);

  const speedOptions = useMemo(() => {
    return PlayerConst.speedOptions;
  }, []);

  const [index, setIndex] = useState(0);
  const [isShowModal, setIsShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [isReplay, setIsReplay] = useState(false);
  const [player, setPlayer] = useState();

  const speedRef = useRef(speed);

  const hiddenCheckout = useRef({
    index: null,
    hidden: null,
  });

  const indexRef = useRef();

  const handleToggleDeleteModal = useCallback(() => {
    if (!deleteLoading) setDeleteModalActive((prev) => !prev);
  }, [deleteLoading]);

  const handleDeleteSession = useCallback(async () => {
    setDeleteLoading(true);
    const result = await deleteSession(deleteId, jwt);
    setToastMessage(result.message);
    handleToggleToast();
    setDeleteLoading(false);
    handleToggleDeleteModal();

    setTimeout(() => {
      let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
      if (sessions.length === 1) {
        router.push("/replays");
      } else if (currentSessionIndex < sessions.length - 1) {
        router.push(`/replays/${sessions[currentSessionIndex + 1]._id}`);
      } else if (currentSessionIndex === sessions.length - 1) {
        router.push(`/replays/${sessions[currentSessionIndex - 1]._id}`);
      }
    }, 500);
  }, [
    jwt,
    sessions,
    id,
    deleteId,
    handleToggleDeleteModal,
    handleToggleToast,
    router,
    setToastMessage,
  ]);

  const onChangeIndex = useCallback(
    (value) => {
      const nextIndex = parseInt(value);
      if (nextIndex >= 0 || nextIndex < list.length) {
        setIndex(nextIndex);
        setDynamicIndex(nextIndex);
        indexRef.current = nextIndex;
      }
    },
    [list],
  );

  const clearRRPlayer = useCallback(() => {
    let rrPlayer = document.querySelector(
      "#__next  #msr_player > div.msr_player__rrweb .rr-player",
    );
    if (rrPlayer) {
      hiddenCheckout.current.hidden = false;
      rrPlayer.remove();
    }
    clearOverlaySkipInactive();
  }, []);

  const renderPlayer = useCallback(() => {
    if (autoPlay !== null && speed !== null) {
      clearRRPlayer();
      try {
        const player = new rrwebPlayer({
          target: document.querySelector("#__next  #msr_player > div.msr_player__rrweb"),
          props: {
            autoPlay: autoPlay,
            speed: speed,
            events: allEvent,
          },
        });
        if (pageview && 0 <= pageview && pageview < timesStartOfPageview.length) {
          player.goto(timesStartOfPageview[pageview] - startTime, autoPlay);
          setIndex(pageview);
          setDynamicIndex(pageview);
        }
        setPlayer(player);
        const replayer = player.getReplayer();
        const playerContainer = document.querySelector(
          "#__next  #msr_player > div.msr_player__rrweb .rr-player",
        );
        const controlBar = playerContainer.querySelector(".rr-controller__btns");

        renderButtonControlInPlayer({
          player,
          replayer,
          controlBar,
          sessions,
          id,
          router,
          path: "replays",
        });

        const rrProgress = playerContainer.querySelector(".rr-progress");
        handleProgressClick(rrProgress, replayer, timesStartOfPageview, setIndex, indexRef);
        renderSplitPageviewInPlayer(rrProgress, list, startTime, endTime, timesStartOfPageview);

        replayer.on("finish", function () {
          if (autoPlay) {
            setIndex((prev) => (prev < list.length - 1 ? prev + 1 : prev));
            setDynamicIndex((prev) => (prev < list.length - 1 ? prev + 1 : prev));
          }
          setIsShowModal(true);
        });

        const rrPlayerFrame = document.querySelector(
          ".msr_player__rrweb .rr-player .rr-player__frame",
        );
        if (rrPlayerFrame) {
          rrPlayerFrame.append(parseHTML(HIDDEN_CONTENT_SESSION));
        }

        replayer.on("event-cast", (event) => {
          if (timesStartOfPageview.includes(event.timestamp)) {
            let index = timesStartOfPageview.findIndex((i) => i === event.timestamp);
            setIndex(index);
            setDynamicIndex(index);
            indexRef.current = index;
          }
          if (
            !hiddenCheckout.current.hidden &&
            event.type === 6 &&
            event.data &&
            event.data.plugin === "msr/checkout"
          ) {
            if (rrPlayerFrame) {
              player.getReplayer().pause();
              hiddenCheckout.current.hidden = event.timestamp;
              const rrPlayerWrapper = rrPlayerFrame.querySelector(".replayer-wrapper");
              if (rrPlayerWrapper) {
                rrPlayerWrapper.style.display = "none";
              }
              const hiddenCheckoutContent = rrPlayerFrame.querySelector(".msr_hidden_content");
              if (hiddenCheckoutContent) {
                hiddenCheckoutContent.style.display = "flex";
              }

              setTimeout(() => {
                hiddenCheckout.current.hidden = null;
                const rrPlayerWrapper = rrPlayerFrame.querySelector(".replayer-wrapper");
                if (rrPlayerWrapper) {
                  rrPlayerWrapper.style.display = "block";
                }
                const hiddenCheckoutContent = rrPlayerFrame.querySelector(".msr_hidden_content");
                if (hiddenCheckoutContent) {
                  hiddenCheckoutContent.style.display = "none";
                }

                if (indexRef.current === timesStartOfPageview.length - 1) {
                  player.goto(endTime - startTime, true);
                } else {
                  let goToTime = timesStartOfPageview[indexRef.current + 1];
                  goToTime = goToTime - startTime;
                  player.goto(goToTime, true);
                  onChangeIndex(indexRef.current + 1);
                }
              }, 5000);
            }
          }
        });

        replayer.on("skip-start", (e) => {
          renderOverlaySkipInactive();
        });

        replayer.on("skip-end", (e) => {
          clearOverlaySkipInactive();
          const speedState = speedRef.current;
          player.setSpeed(speedState);
        });

        replayer.on("state-change", (states) => {
          if (states.speed?.context.timer.speed) {
            speedRef.current = states.speed?.context.timer.speed;
          }
        });

        const replayerWrapper = replayer.wrapper.closest(".rr-player");
        const initiatedSpeed = replayerWrapper.querySelector(
          `.rr-controller__btns button:nth-child(${speedOptions[1]})`,
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
  }, [
    clearRRPlayer,
    speedOptions,
    autoPlay,
    speed,
    list,
    allEvent,
    endTime,
    id,
    onChangeIndex,
    router,
    sessions,
    startTime,
    timesStartOfPageview,
    pageview,
  ]);

  useEffect(() => {
    const delay = setTimeout(function () {
      if (list.length > 0) {
        renderPlayer();
      }
    }, 1000);
    return () => {
      clearTimeout(delay);
    };
  }, [list, renderPlayer]);

  useEffect(() => {
    if (list.length > 0) {
      setFullscreenHref(new URL(list[index].href));
    }
  }, [index, list]);

  useEffect(() => {
    setIsShowModal(false);
    setIndex(0);
    setDynamicIndex(0);
    setIsReplay((prev) => !prev);
  }, [changeIndexReplay]);

  const handleBackAllClick = useCallback(() => {
    router.push(`/replays`);
  }, [router]);

  return (
    <>
      <div className={styles.msr_replayer}>
        <div id="msr_player" className={styles.msr_player}>
          <div className="msr_player__rrweb">{/* Placeholder for rrweb replayer */}</div>
          {isShowModal && (
            <EndReplayModal
              id={id}
              sessions={sessions}
              router={router}
              setDeleteId={setDeleteId}
              isShowModal={isShowModal}
              setIsShowModal={setIsShowModal}
              setIndex={setIndex}
              setDeleteModalActive={setDeleteModalActive}
              type="session"
              setIsReplay={setIsReplay}
              player={player}
            />
          )}
        </div>
        <div className={styles.msr_right_sidebar}>
          <ReplayerTabs
            session={session}
            list={list}
            index={index}
            player={player}
            timesStartOfPageview={timesStartOfPageview}
            startTime={startTime}
            setIndex={setIndex}
            sessionTags={sessionTags}
            setSessionTags={setSessionTags}
          />
        </div>

        <DeleteModal
          resource={"session"}
          resourceId={deleteId}
          active={deleteModalActive}
          onClose={handleToggleDeleteModal}
          loading={deleteLoading}
          onAction={handleDeleteSession}
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
    prevProps.sessionTags === nextProps.sessionTags &&
    prevProps.sessions.length === nextProps.sessions.length
  );
}

export default memo(Replayer, areEqual);
