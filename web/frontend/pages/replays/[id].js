import("isomorphic-fetch");
import { Card, FullscreenBar, Layout, Modal, SkeletonBodyText, Toast } from "@shopify/polaris";
import ModalRedirect from "components/FullScreen/ModalRedirect";
import ReplayerUrl from "components/FullScreen/ReplayerUrl";
import Replayer from "components/Replayer";
import Pagination from "components/Replayer/Pagination";
import FetchingPage from "components/Skeleton/FetchingPage";
import useWindowDimensions from "hooks/useWindowDimensions";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";
import { sessionApi } from "services/session.service";

export default function Replay({ id, jwt }) {
  const settings = useRef({});
  const router = useRouter();
  const { visitor } = router.query;

  const [hasChanged, setHasChanged] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [pageViews, setPageViews] = useState([]);
  const [session, setSession] = useState(null);
  const [sessionID, setSessionID] = useState("");
  const [sessionTags, setSessionTags] = useState([]);
  const [playerAutoplay, setPlayerAutoPlay] = useState(null);
  const [playerSpeed, setPlayerSpeed] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [pagination, setPagination] = useState([]);
  const [changeIndexReplay, setChangeIndexReplay] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fullscreenHref, setFullscreenHref] = useState("");
  const [dynamicIndex, setDynamicIndex] = useState(0);
  const [activeModalRedirect, setActiveModalRedirect] = useState(false);

  const { width } = useWindowDimensions();
  const [mobileModalActive, setMobileModalActive] = useState(false);

  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handleSaveTags = useCallback(async () => {
    setSaveLoading(true);
    try {
      const res = await sessionApi.saveTag({ sessionID, jwt, sessionTags });
      if (res.statusCode === 200) {
        setToastMessage("Notes saved");
        setHasChanged(false);
        settings.current.tags = sessionTags;
      }
    } catch (e) {
      setToastMessage("Save failed");
      console.log(`[MSR:save_session_tags_failed]: `, e);
    }
    handleToggleToast();
    setSaveLoading(false);
  }, [handleToggleToast, jwt, sessionID, sessionTags]);

  const handleToggleMobileModal = useCallback(() => {
    setMobileModalActive((prev) => !prev);
  }, []);

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const sessionRes = await fetch(
        `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      const sessionText = await sessionRes.text();
      const sessionJson = JSON.parse(sessionText);
      if (sessionJson && sessionJson.statusCode === 200) {
        setSession(sessionJson.payload);
        setSessionID(sessionJson.payload._id);
        setSessionTags(sessionJson.payload.tags);
        setPageViews(sessionJson.payload.pageViews);
        settings.current = {
          tags: sessionJson.payload.tags,
        };
      }
    } catch (e) {
      // TODO: error handling
    }

    try {
      const sessionRes = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/settings/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      const sessionJson = await sessionRes.json();
      if (sessionJson && sessionJson.statusCode === 200) {
        setPlayerAutoPlay(sessionJson.payload.replay_autoplay);
        setPlayerSpeed(sessionJson.payload.replay_speed);
      }
    } catch (e) {
      // TODO: error handling
    }
    setFetching(false);
  }, [id, jwt]);

  useEffect(() => {
    if (!fetching) {
      const compareSessionTags = (function () {
        const refs = settings?.current?.tags ? settings.current.tags.sort() : [];
        const curr = sessionTags.sort();
        if (refs.length !== curr.length) {
          return false;
        }
        for (let i = 0; i < refs.length; i++) {
          if (refs[i] !== curr[i]) {
            return false;
          }
        }
        return true;
      })();
      setHasChanged(!compareSessionTags);
    }
  }, [fetching, sessionTags]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (width <= 756) {
      setMobileModalActive(true);
    } else {
      setMobileModalActive(false);
    }
  }, [width]);

  const fetchDataPagination = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions/${id}/recent?currentPage=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      const resJson = await res.json();
      if (resJson && resJson.statusCode === 200) {
        setPagination(resJson.payload.sessions);
        setHasPrevious(resJson.payload.hasPrevious);
        setHasNext(resJson.payload.hasNext);
      }
    } catch (error) {
      // TODO: error handling
    }
    setLoading(false);
  }, [currentPage, id, jwt]);

  useEffect(() => {
    fetchDataPagination();
  }, [currentPage, fetchDataPagination]);

  const handlePaginationClick = useCallback(
    (id, isActive) => {
      if (isActive) {
        setChangeIndexReplay((prev) => !prev);
      } else {
        router.push(`/replays/${id}${visitor ? `?visitor=${visitor}` : ""}`);
      }
    },
    [router, visitor],
  );
  const handleActionClick = useCallback(() => {
    if (hasChanged) {
      setActiveModalRedirect(!activeModalRedirect);
    } else {
      router.push("/replays");
    }
  }, [hasChanged, activeModalRedirect]);

  return (
    <>
      <FullscreenBar onAction={handleActionClick}>
        {fetching ? (
          <SkeletonBodyText lines={4} />
        ) : (
          <ReplayerUrl
            href={fullscreenHref}
            index={dynamicIndex}
            totalIndex={pageViews ? pageViews.length : 0}
            isSave={hasChanged}
            onSave={handleSaveTags}
            loading={saveLoading}
            setToastMessage={setToastMessage}
            setToastActive={setToastActive}
          />
        )}
      </FullscreenBar>
      <div>
        {fetching ? (
          <FetchingPage />
        ) : (
          <div id="replay-container" className={""}>
            <Layout>
              <Layout.Section>
                <Card sectioned>
                  <Replayer
                    session={session}
                    list={pageViews}
                    autoPlay={playerAutoplay}
                    speed={playerSpeed}
                    jwt={jwt}
                    sessions={pagination}
                    toastMessage={toastMessage}
                    setToastMessage={setToastMessage}
                    handleToggleToast={handleToggleToast}
                    changeIndexReplay={changeIndexReplay}
                    sessionTags={sessionTags}
                    setSessionTags={setSessionTags}
                    setFullscreenHref={setFullscreenHref}
                    setDynamicIndex={setDynamicIndex}
                  />
                  <Pagination
                    list={pagination}
                    active={sessionID}
                    onClick={handlePaginationClick}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                    setCurrentPage={setCurrentPage}
                    loading={loading}
                  />
                </Card>
              </Layout.Section>
              <Modal
                open={mobileModalActive}
                onClose={handleToggleMobileModal}
                title={"Warning"}
                primaryAction={{
                  content: "OK, got it!",
                  onAction: handleToggleMobileModal,
                }}
              >
                <Modal.Section>
                  <p>Watching sessions on mobile may not deliver the best experience.</p>
                </Modal.Section>
              </Modal>
              <ModalRedirect
                active={activeModalRedirect}
                setActive={setActiveModalRedirect}
                onRedirect={() => {
                  router.push("/replays");
                }}
                onClose={() => {
                  setActiveModalRedirect(!activeModalRedirect);
                }}
              />
              {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
            </Layout>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, res, query }) => {
      const jwt = req.cookies["midaJWT"];
      const id = query.id;

      if (jwt) {
        if (!store.getState().general.name) {
          store.dispatch(SAGA_GET_SHOP_DATA_ASYNC(jwt));
          store.dispatch(END);
          await store.sagaTask.toPromise();
        }
        if (!store.getState().general.isAuthenticated) {
          res.writeHead(301, { Location: "/login.html" });
          res.end();
        }
      } else {
        res.writeHead(301, { Location: "/login.html" });
        res.end();
      }

      return {
        props: {
          id,
          jwt,
        },
      };
    },
);
