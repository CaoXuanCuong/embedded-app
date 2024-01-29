import {
  LegacyCard,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  TextContainer,
} from "@shopify/polaris";
export default function FetchingPage() {
  return (
    <Layout>
      <Layout.Section>
        <LegacyCard sectioned>
          <SkeletonBodyText />
        </LegacyCard>
        <LegacyCard sectioned>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </TextContainer>
        </LegacyCard>
        <LegacyCard sectioned>
          <TextContainer>
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText />
          </TextContainer>
        </LegacyCard>
      </Layout.Section>
    </Layout>
  );
}
