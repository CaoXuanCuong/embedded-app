import { Icon } from "@shopify/polaris";
import {
  AddProductMajor,
  BuyButtonMajor,
  CartMajor,
  CheckoutMajor,
  CircleTickOutlineMinor,
  CollectionsMajor,
  ConversationMinor,
  GlobeMajor,
  HideMinor,
  ProductsMajor,
  QuestionMarkMajor,
  ViewMinor,
} from "@shopify/polaris-icons";
import { useI18n } from "@shopify/react-i18n";
import TimeLineEvent from "consts/TimelineEvent.const";
import Link from "next/link";
import React from "react";
import styles from "../Replayer.module.css";

export default function BehaviorItem({ behavior, view }) {
  let icon = "NONE";
  let content = "NONE";

  if (view) {
    icon = <Icon source={GlobeMajor} tone="base" />;
    content = <ViewPage page={view} />;
  } else if (behavior) {
    const type = behavior.type;
    const data = behavior.data;
    switch (type) {
      case TimeLineEvent.VIEW_PRODUCT:
        icon = <Icon source={ProductsMajor} tone="base" />;
        content = <ViewProduct data={data} />;
        break;
      case TimeLineEvent.VIEW_CART:
        icon = <Icon source={CartMajor} tone="base" />;
        content = <ViewCart data={data} />;
        break;
      case TimeLineEvent.VIEW_COLLECTION:
        icon = <Icon source={CollectionsMajor} tone="base" />;
        content = <ViewCollection data={data} />;
        break;
      case TimeLineEvent.ADD_TO_CART:
        icon = <Icon source={AddProductMajor} tone="base" />;
        content = <AddToCart data={data} />;
        break;
      case TimeLineEvent.PURCHASE:
        icon = <Icon source={CheckoutMajor} tone="base" />;
        content = <Purchase data={data} />;
        break;
      case TimeLineEvent.CHECKOUT:
        icon = <Icon source={BuyButtonMajor} tone="base" />;
        content = <Checkout data={data} />;
        break;
      case TimeLineEvent.SURVEY:
        icon = <Icon source={QuestionMarkMajor} tone="base" />;
        content = <Survey data={data} subTitle={"Answer survey"} />;
        break;
      case TimeLineEvent.SURVEY_ANSWERED:
        icon = <Icon source={CircleTickOutlineMinor} tone="base" />;
        content = <Survey data={data} subTitle={"Answer survey"} />;
        break;
      case TimeLineEvent.SURVEY_DISMISSED:
        icon = <Icon source={HideMinor} tone="base" />;
        content = <Survey data={data} subTitle={"Dismiss survey"} />;
        break;
      case TimeLineEvent.SURVEY_VIEWED:
        icon = <Icon source={ViewMinor} tone="base" />;
        content = <Survey data={data} subTitle={"View survey"} />;
        break;
      case TimeLineEvent.SURVEY_FEEDBACK:
        icon = <Icon source={ConversationMinor} tone="base" />;
        content = <Survey data={data} subTitle={"Send feedback for"} />;
        break;
    }
  }

  return (
    <React.Fragment>
      <div className={styles.msr_timeline__list_item__circle}>{icon}</div>
      <div className={styles.msr_timeline__list_item__info}>{content}</div>
    </React.Fragment>
  );
}
function AddToCart({ data }) {
  return <React.Fragment>Add to cart</React.Fragment>;
}

function ViewCart({ data }) {
  return <React.Fragment>View cart</React.Fragment>;
}

function Checkout({ data }) {
  return (
    <React.Fragment>
      <p>Checkout</p>
      <p>
        <i>
          <small>Checkout is private content.</small>
        </i>
      </p>
    </React.Fragment>
  );
}

function ViewCollection({ data }) {
  return (
    <React.Fragment>
      View collection{" "}
      <a href={data.url} target="_blank" rel="noreferrer">
        {data.name}
      </a>
    </React.Fragment>
  );
}

function ViewProduct({ data }) {
  return (
    <React.Fragment>
      View product{" "}
      <a href={data.url} target="_blank" rel="noreferrer">
        {data.name}
      </a>
    </React.Fragment>
  );
}

function Purchase({ data }) {
  const [i18n] = useI18n();
  return (
    <React.Fragment>
      Purchase{" "}
      <a href={data.url} target="_blank" rel="noreferrer">
        <p>
          Total:{" "}
          {i18n.formatCurrency(data.total_price, {
            currency: data.currency,
            form: "explicit",
          })}
        </p>
      </a>
    </React.Fragment>
  );
}

function ViewPage({ page }) {
  return (
    <React.Fragment>
      <strong>{page}</strong>
    </React.Fragment>
  );
}

function Survey({ data, subTitle }) {
  return (
    <React.Fragment>
      {subTitle} <Link href={`/surveys/results/${data.surveyId}`}>{data.surveyName}</Link>
    </React.Fragment>
  );
}
