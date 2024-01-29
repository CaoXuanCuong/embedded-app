import {
  Button,
  Icon,
  BlockStack,
  LegacyCard,
  LegacyStack,
  Modal,
  InlineStack,
} from "@shopify/polaris";
import { DeleteMinor, ReplayMinor } from "@shopify/polaris-icons";
import LocalStorageConst from "consts/LocalStorage.const";
import { useCallback, useEffect, useState } from "react";
import styles from "./EndReplayModal.module.css";

function PageviewEndReplayModal({
  id,
  router,
  setDeleteId,
  isShowModal,
  setIsShowModal,
  setIndex,
  setDeleteModalActive,
  type,
  setIsReplay,
  pageviews,
}) {
  const [isBtnsDisabled, setIsBtnsDisabled] = useState({
    previous: false,
    next: false,
  });
  const [path, setPath] = useState(function () {
    if (type === "pageview") {
      return "pageviews";
    } else if (type === "session") {
      return "replays";
    }
  });

  const [content, setContent] = useState(function () {
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
  });

  const [autoPageviewNext, setAutoPageviewNext] = useState(() => {
    const autoNextPageview = JSON.parse(localStorage.getItem(LocalStorageConst.AUTO_NEXT)) || "";
    return autoNextPageview ? autoNextPageview : false;
  });
  const [timeoutPageviewId, setTimeoutPageviewId] = useState(null);
  const [progressPageview, setProgressPageview] = useState(false);

  useEffect(() => {
    let idTimeout = "";
    if (autoPageviewNext && path === "pageviews") {
      let currentPageviewIndex = pageviews.findIndex((ele) => ele._id === id);
      if (currentPageviewIndex !== pageviews.length - 1) {
        setProgressPageview(true);
        idTimeout = setTimeout(() => {
          router.push(`/${path}/${pageviews[currentPageviewIndex + 1]._id}`);
        }, 3000);
        setTimeoutPageviewId(idTimeout);
      }
    }
    return () => {
      clearTimeout(idTimeout);
    };
  }, [autoPageviewNext, path, id, pageviews, router, setProgressPageview]);

  useEffect(() => {
    let currentPageviewIndex = pageviews.findIndex((ele) => ele._id === id);
    if (currentPageviewIndex === pageviews.length - 1 || pageviews.length === 1) {
      setIsBtnsDisabled((prev) => {
        return { ...prev, next: true };
      });
    }
    if (currentPageviewIndex === 0 || pageviews.length === 1) {
      setIsBtnsDisabled((prev) => {
        return { ...prev, previous: true };
      });
    }
  }, [pageviews, id]);

  const handleModalCloseClick = useCallback(() => {
    setIsShowModal(false);
  }, [setIsShowModal]);

  const handleBtnNextPageviewClick = useCallback(() => {
    let currentPageviewIndex = pageviews.findIndex((ele) => ele._id === id);
    router.push(`/${path}/${pageviews[currentPageviewIndex + 1]._id}`);
  }, [id, pageviews, path, router]);

  const handleBtnReplayClick = useCallback(() => {
    if (type === "pageview" && setIsReplay) {
      setIsShowModal(false);
      setIsReplay((prevState) => !prevState);
    } else if (type === "session") {
      setIsShowModal(false);
      setIndex(0);
      setIsReplay((prev) => !prev);
    }
  }, [type, setIndex, setIsReplay, setIsShowModal]);

  const handleBtnDeletePageViewClick = useCallback(() => {
    setDeleteId(id);
    setDeleteModalActive(true);
  }, [id, setDeleteId, setDeleteModalActive]);

  const handleCancelClick = useCallback(() => {
    setProgressPageview(false);
    if (timeoutPageviewId) {
      clearTimeout(timeoutPageviewId);
    }
  }, [timeoutPageviewId]);

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
          {type === "pageview" && (
            <Button
              size="large"
              icon={<Icon source={DeleteMinor} tone="critical" />}
              onClick={handleBtnDeletePageViewClick}
            >
              Delete
            </Button>
          )}
        </LegacyStack>
      </Modal.Section>
      <Modal.Section>
        <InlineStack align="end">
          {progressPageview ? (
            <Button size="large" onClick={handleCancelClick}>
              Cancel
            </Button>
          ) : (
            <Button size="large" onClick={handleModalCloseClick}>
              Exit
            </Button>
          )}
          <div
            onClick={isBtnsDisabled.next ? null : handleBtnNextPageviewClick}
            className={`${styles.btn_slider} ${isBtnsDisabled.next && `${styles.btn_disabled}`} ${
              progressPageview ? `${styles.active}` : `${styles.unactive}`
            }`}
          >
            Play next
            {progressPageview && (
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

export default PageviewEndReplayModal;
