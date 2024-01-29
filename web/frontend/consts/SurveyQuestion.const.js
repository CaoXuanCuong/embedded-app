import { CircleCancelMinor, CircleTickMinor, ViewMinor } from "@shopify/polaris-icons";

export const VOTE_QUESTION = {
  type: "vote",
  options: ["Like", "Dislike"],
  heading: "Do you love our website?",
  body: "Please leave a feedback so that we can improve",
};

export const TEXT_QUESTION = {
  type: "text",
  heading: "Thank you for your feedback!",
  placeholder: "Please share with us more...",
  headingDisLike: "Thank you for your feedback!",
  placeholderDisLike: "Please share with us more...",
};
export const QUESTION = {
  CHOICES: {
    type: "choices",
    options: ["", "", ""],
    heading: "",
    body: "",
    multiple: false,
  },
  VOTE: {
    type: "vote",
    options: ["Like", "Dislike"],
    heading: "Do you love our website?",
    body: "Please leave a feedback so that we can improve",
  },
  TEXT: {
    type: "text",
    heading: "Thank you for your feedback!",
    placeholder: "Please share with us more...",
    headingDisLike: "Thank you for your feedback!",
    placeholderDisLike: "Please share with us more...",
  },
};

export const QUESTIONS = Object.values(QUESTION);

export const STATUS_ICON = {
  viewed: {
    icon: ViewMinor,
    color: "base",
  },
  dismissed: {
    icon: CircleCancelMinor,
    color: "critical",
  },
  completed: {
    icon: CircleTickMinor,
    color: "success",
  },
};
