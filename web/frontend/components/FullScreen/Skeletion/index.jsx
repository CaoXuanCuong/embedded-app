import {
  Layout,
  LegacyCard,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  TextContainer,
} from "@shopify/polaris";

const FullScreenSkeleton = ({}) => {
  return (
    <Page fullWidth={true}>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <TextContainer>
              <SkeletonDisplayText size="extraLarge" />
              <SkeletonBodyText lines={10} />
            </TextContainer>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default FullScreenSkeleton;
