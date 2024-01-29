import { Button, Icon, InlineStack, LegacyStack, Modal } from "@shopify/polaris";
import { DeleteMinor, ReplayMinor } from "@shopify/polaris-icons";
import LocalStorageConst from "consts/LocalStorage.const";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./EndReplayModal.module.css";

function EndReplayModal({
  id,
  sessions,
  router,
  setDeleteId,
  isShowModal,
  setIsShowModal,
  setIndex,
  setDeleteModalActive,
  type,
  setIsReplay,
  player,
}) {
  const [isBtnsDisabled, setIsBtnsDisabled] = useState({
    previous: false,
    next: false,
  });
  const path = useMemo(
    function () {
      if (type === "pageview") {
        return "pageviews";
      } else if (type === "session") {
        return "replays";
      }
    },
    [type],
  );

  const content = useMemo(
    function () {
      if (type === "pageview") {
        return {
          title: "Pageview ended",
          desc: "Please select the next pageview",
          prevButton: "Previous pageview",
          nextButton: "Next pageview",
        };
      } else if (type === "session") {
        return {
          title: "Session ended",
          desc: "Please select the next session",
          prevButton: "Previous session",
          nextButton: "Next session",
        };
      }
    },
    [type],
  );

  const autoNext = useMemo(() => {
    const autoNextSession = JSON.parse(localStorage.getItem(LocalStorageConst.AUTO_NEXT)) || "";
    return autoNextSession ? autoNextSession : false;
  }, []);

  const [timeoutId, setTimeoutId] = useState(null);
  const [progress, setProgress] = useState(false);

  useEffect(() => {
    let idTimeout = "";
    if (autoNext && path === "replays") {
      let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
      if (currentSessionIndex !== sessions.length - 1) {
        setProgress(true);
        idTimeout = setTimeout(() => {
          router.push(`/${path}/${sessions[currentSessionIndex + 1]._id}`);
        }, 3000);
        setTimeoutId(idTimeout);
      }
    }
    return () => {
      clearTimeout(idTimeout);
    };
  }, [autoNext, path, id, sessions, router, setProgress]);

  useEffect(() => {
    let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
    if (currentSessionIndex === sessions.length - 1 || sessions.length === 1) {
      setIsBtnsDisabled((prev) => {
        return { ...prev, next: true };
      });
    }
    if (currentSessionIndex === 0 || sessions.length === 1) {
      setIsBtnsDisabled((prev) => {
        return { ...prev, previous: true };
      });
    }
  }, [sessions, id]);

  const handleModalCloseClick = useCallback(() => {
    setIsShowModal(false);
  }, [setIsShowModal]);

  const handleBtnNextClick = useCallback(() => {
    let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
    router.push(`/${path}/${sessions[currentSessionIndex + 1]._id}`);
  }, [id, sessions, path, router]);

  const handleBtnReplayClick = useCallback(() => {
    if (type === "pageview" && setIsReplay) {
      setIsShowModal(false);
      setIsReplay((prevState) => !prevState);
    } else if (type === "session") {
      setIsShowModal(false);
      setIndex(0);
      setIsReplay((prev) => !prev);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (player) {
        const replayer = player.getReplayer();
        replayer.play();
      }
    }
  }, [type, setIndex, setIsReplay, setIsShowModal, player, timeoutId]);

  const handleBtnDeleteClick = useCallback(() => {
    setDeleteId(id);
    setDeleteModalActive(true);
  }, [id, setDeleteId, setDeleteModalActive]);

  const handleCancelClick = useCallback(() => {
    setProgress(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [timeoutId]);

  return (
    <Modal open={isShowModal} onClose={handleModalCloseClick} title={content.title}>
      <Modal.Section>
        <LegacyStack vertical>
          <p>{content.desc}</p>
          <Button
            size="large"
            icon={<Icon source={ReplayMinor} tone="success" />}
            onClick={handleBtnReplayClick}
          >
            Replay
          </Button>
          {type === "session" && (
            <Button
              size="large"
              icon={<Icon source={DeleteMinor} tone="critical" />}
              onClick={handleBtnDeleteClick}
            >
              Delete
            </Button>
          )}
        </LegacyStack>
      </Modal.Section>
      <Modal.Section>
        <InlineStack align="end">
          {progress ? (
            <Button size="large" onClick={handleCancelClick}>
              Cancel
            </Button>
          ) : (
            <Button size="large" onClick={handleModalCloseClick}>
              Exit
            </Button>
          )}
          <div
            onClick={isBtnsDisabled.next ? null : handleBtnNextClick}
            className={`${styles.btn_slider} ${isBtnsDisabled.next && `${styles.btn_disabled}`} ${
              progress ? `${styles.active}` : `${styles.unactive}`
            }`}
          >
            Play next
            {progress && (
              <>
                <div className={`${styles.bellow}`}>
                  <span>Play next</span>
                </div>
                <div className={`${styles.above}`}>
                  <span>Play next</span>
                </div>
              </>
            )}
          </div>
        </InlineStack>
      </Modal.Section>
    </Modal>
  );
}

export default EndReplayModal;
