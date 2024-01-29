import { Page, Layout, LegacyCard } from "@shopify/polaris";
import { useEffect } from "react";

export default function FeatureRequests() {
  useEffect(() => {
    var script = document.createElement("script");
    script.onload = function () {
      window.upvoty.init("render", {
        boardHash: "6c036c5969a0c6e4b86e69b0226d725d6baaabe1300b979652b64eef32c9f7e8",
        ssoToken: null,
        baseUrl: "bss-commerce-shopify.upvoty.com/b/mida-heatmap-records-replay",
      });
    };

    document.head.appendChild(script);
    script.src = "https://bss-commerce-shopify.upvoty.com/javascript/upvoty.embed.js";

    const removeObjectUpvoty = () => {
      if (window.upvoty) {
        window.upvoty.destroy();
      }
      const upvotyScript = document.querySelector(
        '[src="https://bss-commerce-shopify.upvoty.com/javascript/upvoty.embed.js"]',
      );
      if (upvotyScript) {
        upvotyScript.remove();
      }
    };
    return removeObjectUpvoty;
  }, []);

  return (
    <div className="feature-requests">
      <Page title="Feature Requests">
        <Layout>
          <Layout.Section>
            <LegacyCard>
              <LegacyCard.Section>
                <div data-upvoty=""></div>
              </LegacyCard.Section>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}
