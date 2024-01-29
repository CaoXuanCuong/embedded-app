import("isomorphic-fetch");
import {
  FullscreenBar,
  Layout,
  LegacyCard,
  Modal,
  SkeletonBodyText,
  Toast,
} from "@shopify/polaris";
import ModalRedirect from "components/FullScreen/ModalRedirect";
import ReplayerUrl from "components/FullScreen/ReplayerUrl";
import PageviewReplayer from "components/Replayer/PageviewReplayer";
import PaginationPageview from "components/Replayer/PaginationPageview";
import FetchingPage from "components/Skeleton/FetchingPage";
import useWindowDimensions from "hooks/useWindowDimensions";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { selectShop } from "redux/reducers/general.reducer";
import { wrapper } from "redux/store";
import { pageviewApi } from "services/pageview.service";

export default function PageView({ id, jwt }) {
  const settings = useRef({});
  const router = useRouter();

  const { myshopifyDomain } = useSelector(selectShop);
  const [hasChanged, setHasChanged] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [pageViews, setPageViews] = useState([]);
  const [pageviewID, setPageviewID] = useState("");
  const [pageviewDate, setPageviewDate] = useState("");
  const [pageviewTags, setPageviewTags] = useState([]);
  const [sessionIp, setSessionIp] = useState("");
  const [visitorID, setVisitorID] = useState("");
  const [visitorLastActive, setVisitorLastActive] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(null);
  const [deviceLocation, setDeviceLocation] = useState("");
  const [deviceOS, setDeviceOS] = useState("");
  const [deviceBrowser, setDeviceBrowser] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [playerAutoplay, setPlayerAutoPlay] = useState(null);
  const [playerSpeed, setPlayerSpeed] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [pagination, setPagination] = useState([]);
  const [duration, setDuration] = useState(0);
  const [changeIndexReplay, setChangeIndexReplay] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fullscreenHref, setFullscreenHref] = useState("");

  const { width } = useWindowDimensions();
  const [mobileModalActive, setMobileModalActive] = useState(false);
  const [activeModalRedirect, setActiveModalRedirect] = useState(false);

  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handleToggleMobileModal = useCallback(() => {
    setMobileModalActive((prev) => !prev);
  }, []);

  const fetchData = useCallback(async () => {
    let paginationData = [];
    try {
      const res = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      const resText = await res.text();
      const resJson = JSON.parse(resText);
      if (resJson && resJson.statusCode === 200) {
        let { pageView } = resJson.payload;
        let { session } = pageView;
        let { duration } = pageView;
        paginationData.push(pageView);
        const pageviewDate = new Date(pageView.createdAt);
        const visitorDate = new Date(resJson.payload.visitor.updatedAt);
        setFullscreenHref(new URL(pageView.href));
        setPageviewID(pageView._id);
        setPageviewDate(
          `${pageviewDate.toLocaleDateString()} ${pageviewDate.toLocaleTimeString()}`,
        );
        setVisitorLastActive(
          `${visitorDate.toLocaleDateString()} ${visitorDate.toLocaleTimeString()}`,
        );
        setVisitorID(session.visitor);
        setCustomerId(session.customer_id);
        setCustomerEmail(session.customer_email);
        setDeviceLocation(session.location);
        setPageviewTags(pageView.tags);
        setSessionIp(session.ip);
        setDeviceBrowser(session.browser);
        setDeviceOS(session.os);
        setDeviceType(session.device);
        setPageViews([pageView]);
        setDuration(duration);
        settings.current = {
          tags: pageView.tags,
        };
      }
    } catch (error) {
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

    try {
      const url = new URL(paginationData[0].href);
      const hrefSearch = url.origin + url.pathname;

      const [prevRes, nextRes] = await Promise.all([
        fetch(
          `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/?href=${hrefSearch}&limit=2&createdAt=${paginationData[0].createdAt}&rel=previous`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          },
        ),
        fetch(
          `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/?href=${hrefSearch}&limit=2&createdAt=${paginationData[0].createdAt}&rel=next`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          },
        ),
      ]);
      const [prevJson, nextJson] = await Promise.all([prevRes.json(), nextRes.json()]);
      if (prevJson && prevJson.statusCode === 200) {
        paginationData = prevJson.payload.pageViews.reverse().concat(paginationData);
      }
      if (nextJson && nextJson.statusCode === 200) {
        paginationData = paginationData.concat(nextJson.payload.pageViews);
      }

      paginationData.length > 0 && setPagination(paginationData.reverse());
    } catch (error) {
      // TODO: error handling
    }
    setFetching(false);
  }, [id, jwt]);

  const fetchDataPagination = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/${id}/recent?currentPage=${currentPage}`,
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
        setPagination(resJson.payload.pageviews);
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

  const handleSaveTags = useCallback(async () => {
    setSaveLoading(true);
    try {
      const res = await pageviewApi.saveTags({ pageviewId: pageviewID, jwt, pageviewTags });
      if (res.statusCode === 200) {
        setToastMessage("Notes saved");
        setHasChanged(false);
        settings.current.tags = pageviewTags;
      }
    } catch (e) {
      setToastMessage("Save failed");
      console.log(`[MSR:pageview_save_tags_failed]: `, e);
    }
    handleToggleToast();
    setSaveLoading(false);
  }, [handleToggleToast, jwt, pageviewID, pageviewTags]);

  useEffect(() => {
    if (!fetching) {
      const comparePageviewTags = (function () {
        const refs = settings.current.tags.sort();
        const curr = pageviewTags.sort();
        if (JSON.stringify(refs) === JSON.stringify(curr)) {
          return true;
        } else {
          return false;
        }
      })();
      setHasChanged(!comparePageviewTags);
    }
  }, [fetching, pageviewTags]);

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

  const handlePaginationClick = useCallback(
    (id, isActive) => {
      if (isActive) {
        setChangeIndexReplay((prev) => !prev);
      } else {
        router.push(`/pageviews/${id}`);
      }
    },
    [router],
  );

  const handleActionClick = useCallback(() => {
    if (hasChanged) {
      setActiveModalRedirect(!activeModalRedirect);
    } else {
      router.push("/pageviews");
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
            isSave={hasChanged}
            onSave={handleSaveTags}
            loading={saveLoading}
            setToastActive={setToastActive}
            setToastMessage={setToastMessage}
          />
        )}
      </FullscreenBar>
      {fetching ? (
        <FetchingPage />
      ) : (
        <div id="pageview-container" className={"pageview_container"}>
          <Layout>
            <Layout.Section>
              <LegacyCard sectioned>
                <PageviewReplayer
                  list={pageViews}
                  autoPlay={playerAutoplay}
                  speed={playerSpeed}
                  jwt={jwt}
                  changeIndexReplay={changeIndexReplay}
                  pageViewPagination={pagination}
                  createdDate={pageviewDate}
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
                  setToastMessage={setToastMessage}
                  handleToggleToast={handleToggleToast}
                />
                <PaginationPageview
                  list={pagination}
                  active={pageviewID}
                  onClick={handlePaginationClick}
                  fullWidth
                  hasPrevious={hasPrevious}
                  hasNext={hasNext}
                  setCurrentPage={setCurrentPage}
                  loading={loading}
                />
              </LegacyCard>
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
                <p>Watching pageviews on mobile may not deliver the best experience.</p>
              </Modal.Section>
            </Modal>
            <ModalRedirect
              active={activeModalRedirect}
              setActive={setActiveModalRedirect}
              onRedirect={() => {
                router.push("/pageviews");
              }}
              onClose={() => {
                setActiveModalRedirect(!activeModalRedirect);
              }}
            />
            {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
          </Layout>
        </div>
      )}
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
