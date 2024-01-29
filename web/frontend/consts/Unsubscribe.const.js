import { Link } from "@shopify/polaris";

export const REASON_OPTIONS = {
  DEFAULT: "Select",
  HARD_TO_CONFIG: "Hard to configure or use feature",
  NOT_SEE_WORK: `Can't see it work on storefront`,
  EXPENSIVE_CODE: "Expensive or unexpected cost",
  NOT_COMPATIBLE: "Not compatible with other third-party applications",
  NOT_NEED_ANYMORE: "Do not need it any more",
  OTHER: "Other",
};

export const HelpEmail = "mailto:support-sbc@bsscommerce.com";

export const REASON_DATA = {
  [REASON_OPTIONS.DEFAULT]: { title: "", helpText: "" },
  [REASON_OPTIONS.HARD_TO_CONFIG]: {
    title: "Tell us what feature is hard to configure and describe your experience",
    helpText: "We could improve the configuration steps based on your feedback",
  },
  [REASON_OPTIONS.NOT_SEE_WORK]: {
    title: "Tell us the feature that doesn't work on your store front",
    helpText: (
      <div>
        Contact us via{" "}
        {
          <Link external={true} url={HelpEmail}>
            support-sbc@bsscommerce.com.
          </Link>
        }{" "}
        to get help implementing it on your storefront
      </div>
    ),
  },
  [REASON_OPTIONS.EXPENSIVE_CODE]: {
    title: "Tell us range of pricing you think is reasonable for you",
    helpText: "We could consider to adjust pricing based on your feedback",
  },
  [REASON_OPTIONS.NOT_COMPATIBLE]: {
    title: "Tell us other third-party applications that you are using",
    helpText: "We could consider to integrate with these apps",
  },
  [REASON_OPTIONS.NOT_NEED_ANYMORE]: {
    title: "Tell us if there is any feature update we can do to meet your need",
    helpText: "We could improve our app better based on your feedback",
  },
  [REASON_OPTIONS.OTHER]: {
    title: "Describe your experience with our app",
    helpText: "We could improve our app better based on your feedback",
  },
};

export const ReasonOptions = [
  { label: REASON_OPTIONS.DEFAULT, value: REASON_OPTIONS.DEFAULT },
  { label: REASON_OPTIONS.HARD_TO_CONFIG, value: REASON_OPTIONS.HARD_TO_CONFIG },
  { label: REASON_OPTIONS.NOT_SEE_WORK, value: REASON_OPTIONS.NOT_SEE_WORK },
  { label: REASON_OPTIONS.EXPENSIVE_CODE, value: REASON_OPTIONS.EXPENSIVE_CODE },
  { label: REASON_OPTIONS.NOT_COMPATIBLE, value: REASON_OPTIONS.NOT_COMPATIBLE },
  { label: REASON_OPTIONS.NOT_NEED_ANYMORE, value: REASON_OPTIONS.NOT_NEED_ANYMORE },
  { label: REASON_OPTIONS.OTHER, value: REASON_OPTIONS.OTHER },
];

export const InitialModalState = {
  CONTACT_SUPPORT: {
    title: "Are you sure to unsubscribe?",
    type: "contact_support_modal",
    primaryAction: "",
    secondaryActions: "",
  },
  FEEDBACK: {
    title: "We appreciate your feedback!",
    type: "feedback_modal",
    primaryAction: "",
    secondaryActions: "",
  },
  UNSUBSCRIBE: {
    title: "Thanks for your feedback!",
    type: "unsubscribe_modal",
    primaryAction: "",
    secondaryActions: "",
  },
};
