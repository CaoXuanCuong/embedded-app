import { useState } from "react";
import {
  Button,
  ChoiceList,
  Icon,
  LegacyStack,
  TextField,
  Text,
  Tooltip,
  InlineStack,
} from "@shopify/polaris";
import { CircleInformationMajor } from "@shopify/polaris-icons";
import styles from "./SelectPage.module.css";
export default function SelectPage({ surveyData, onSetSurveyData, domain }) {
  const { apply_pages, apply_specific_pages } = surveyData;
  const baseUrl = `https://${domain}`;
  const listPageOptions = [
    {
      label: "Home page",
      value: "index",
      helpText: `https://${domain}`,
    },
    {
      label: "Cart page",
      value: "cart",
      helpText: `https://${domain}/cart`,
    },
    {
      label: "All product pages",
      value: "all_product_pages",
      helpText: `All pages start with https://${domain}/products/...`,
    },
    {
      label: "Page of collections",
      value: "list-collections",
      helpText: `https://${domain}/collections`,
    },
    {
      label: "Search page",
      value: "search",
      helpText: `https://${domain}/search`,
    },
    {
      label: "Blog page",
      value: "blog",
      helpText: `https://${domain}/blogs/news`,
    },
    {
      label: "All blog posts",
      value: "all_articles",
    },
    {
      label: (
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "5px" }}>All custom pages</div>
          <Tooltip content="The app might not restrict pages created by 3rd-party apps. Please contact us for further check.">
            <Icon source={CircleInformationMajor} />
          </Tooltip>
        </div>
      ),
      value: "all_custom_pages",
      helpText: `All pages start with https://${domain}/pages/...`,
    },
    {
      label: "Specific URLs",
      value: "specific_url",
      helpText: "Example: /blogs/news/test-blog",
      disabled: false,
    },
  ];
  const [value, setValue] = useState("");

  const handleAddPage = () => {
    let addedUrl = value.trim();
    addedUrl = addedUrl.replace(baseUrl, "");
    addedUrl = addedUrl.replace(domain, "");

    if (!addedUrl.length) {
      addedUrl = "/";
    } else {
      addedUrl =
        "/" +
        addedUrl
          .split("/")
          .filter((item) => item && item.length > 0)
          .join("/");
    }

    let newPages = Array.from(new Set([...apply_specific_pages, addedUrl]));
    onSetSurveyData({ apply_specific_pages: newPages.sort() });
    setValue("");
  };

  const handleRemovePage = (deletePage) => {
    const newPages = apply_specific_pages.filter((page) => page !== deletePage);
    onSetSurveyData({
      ...surveyData,
      apply_specific_pages: newPages,
    });
  };
  return (
    <LegacyStack vertical>
      <ChoiceList
        allowMultiple
        choices={listPageOptions}
        selected={apply_pages}
        onChange={(value) => {
          onSetSurveyData({
            apply_pages: value,
          });
        }}
      />
      {apply_pages.indexOf("specific_url") !== -1 && (
        <div className={styles.container}>
          <div>
            <TextField
              autoComplete="off"
              value={value}
              onChange={(value) => setValue(value)}
              connectedRight={
                <Button size="large" onClick={handleAddPage}>
                  Add page
                </Button>
              }
            />
          </div>
          <ul className={styles.pages_list}>
            {apply_specific_pages.map((specificUrl, index) => {
              return (
                <li className={styles.page_item} key={index}>
                  <InlineStack>
                    <Text as="span" tone="subdued">
                      {baseUrl}
                    </Text>
                    <Text>{specificUrl}</Text>
                  </InlineStack>

                  <Button
                    variant="plain"
                    tone="critical"
                    onClick={() => handleRemovePage(specificUrl)}
                  >
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </LegacyStack>
  );
}
