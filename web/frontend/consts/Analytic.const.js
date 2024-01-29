import { Icon } from "@shopify/polaris";
import { QuestionMarkInverseMinor, QuestionMarkMinor } from "@shopify/polaris-icons";

export const VISITOR_CHART_OPTIONS = [
  {
    title: "Total visitors",
    value: "total",
    tooltip: {
      child: <Icon source={QuestionMarkInverseMinor} tone="base" />,
      content: "Total visitors do not contain deleted visitors.",
    },
  },
  { title: "Unique visitors", value: "unique" },
];
