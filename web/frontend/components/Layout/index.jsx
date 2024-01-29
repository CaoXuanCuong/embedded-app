import {
  Frame,
  Layout,
  LegacyCard,
  Loading,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  TextContainer,
} from "@shopify/polaris";
import FullScreenSkeleton from "components/FullScreen/Skeletion";
import { useRouter } from "next/router";
import React, { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMobileNavigation,
  toggleMobileNavigation,
  selectShop,
} from "redux/reducers/general.reducer";

import LayoutNavigation from "./Navigation";
import RecordingNotiModal from "components/Modal/RecordingNoti";
import LayoutTopBar from "./TopBar";

const FULLSCREEN_PATHS = ["/replays/[id]", "/pageviews/[id]"];
const LayoutFrame = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const skipToContentRef = useRef(null);

  const mobileNavigation = useSelector(selectMobileNavigation);

  const handleLoadingPage = (payload) => {
    setIsLoadingPage(payload);
  };

  const handleNavigationToggle = () => {
    dispatch(toggleMobileNavigation());
  };
  const { countTotalSession } = useSelector(selectShop);
  const shouldRenderRecordingNotiModal = router.pathname.includes("/replays");

  const isFullScreen = useMemo(() => {
    if (FULLSCREEN_PATHS.includes(router.pathname)) {
      return true;
    }
    return false;
  }, [router.pathname]);

  return (
    <Frame
      topBar={isFullScreen ? null : <LayoutTopBar />}
      navigation={isFullScreen ? null : <LayoutNavigation onLoadingPage={handleLoadingPage} />}
      showMobileNavigation={mobileNavigation}
      onNavigationDismiss={handleNavigationToggle}
      skipToContentTarget={skipToContentRef.current}
      logo={{
        width: 124,
        topBarSource: `https://${process.env.NEXT_PUBLIC_APP_URL}/static/msr_logo.svg`,
        contextualSaveBarSource: `https://${process.env.NEXT_PUBLIC_APP_URL}/static/msr_logo_white.svg`,
        accessibilityLabel: "MIDA SESSION RECORDING AND REPLAY",
        url: `https://${process.env.NEXT_PUBLIC_APP_URL}/`,
      }}
    >
      {isLoadingPage ? <Loading /> : null}
      {isLoadingPage ? (
        isFullScreen ? (
          <FullScreenSkeleton />
        ) : (
          <SkeletonPage>
            <Layout>
              <Layout.Section>
                <LegacyCard sectioned>
                  <TextContainer>
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={9} />
                  </TextContainer>
                </LegacyCard>
              </Layout.Section>
            </Layout>
          </SkeletonPage>
        )
      ) : (
        <React.Fragment>
          <a id="SkipToContentTarget" ref={skipToContentRef} tabIndex={-1} />
          {children}
          {countTotalSession > 0 && !shouldRenderRecordingNotiModal && <RecordingNotiModal />}
        </React.Fragment>
      )}
    </Frame>
  );
};

export default LayoutFrame;
