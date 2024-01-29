import {
  LegacyCard,
  Frame,
  Layout,
  Loading,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  TextContainer,
} from "@shopify/polaris";
import { useSelector } from "react-redux";
import React, { useRef } from "react";
import LayoutTopBar from "./TopBar";
import { selectIsLoading } from "redux/reducers/general.reducer";

const LayoutShared = ({ children }) => {
  const skipToContentRef = useRef(null);

  const isLoading = useSelector(selectIsLoading);

  return (
    <Frame
      topBar={<LayoutTopBar />}
      skipToContentTarget={skipToContentRef.current}
      logo={{
        width: 124,
        topBarSource: `/public/static/msr_logo.svg`,
        contextualSaveBarSource: `/public/static/msr_logo_white.svg`,
        accessibilityLabel: "MIDA SESSION RECORDING AND REPLAY",
        url: `https://${process.env.NEXT_PUBLIC_APP_URL}/`,
      }}
    >
      {isLoading ? <Loading /> : null}
      {isLoading ? (
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
      ) : (
        <React.Fragment>
          <a id="SkipToContentTarget" ref={skipToContentRef} tabIndex={-1} />
          {children}
        </React.Fragment>
      )}
    </Frame>
  );
};

export default LayoutShared;
