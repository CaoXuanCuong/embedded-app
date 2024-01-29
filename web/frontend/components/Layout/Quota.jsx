import { Banner, BlockStack, ProgressBar, Text } from "@shopify/polaris";
import React from "react";
import { useSelector } from "react-redux";
import { selectShop, selectGeneral } from "redux/reducers/general.reducer";
import styles from "./Quota.module.css";
import MONTH from "../../consts/MonthConstant";

export default function Quota() {
  const { usage, quota, appPlanName } = useSelector(selectShop);
  const { isShowPopup } = useSelector(selectGeneral);

  const newQuota = usage > quota ? quota : usage;
  const progress = Math.floor((newQuota * 100) / quota);

  const handleOpenFreshChat = function () {
    if (
      window.fcWidget &&
      window.fcWidget.open &&
      window.fcWidget.isOpen &&
      typeof window.fcWidget.open === "function" &&
      typeof window.fcWidget.isOpen === "function"
    ) {
      if (!window.fcWidget.isOpen()) {
        window.fcWidget.open();
      }
    }
  };

  return (
    <React.Fragment>
      <BlockStack gap={"050"}>
        <Text as="p">
          Current Month:{" "}
          <Text as="span" fontWeight="semibold">
            {MONTH[new Date().getMonth() + 1]}
          </Text>
        </Text>
        <Text as="p">
          Current Plan:{" "}
          <Text as="span" fontWeight="semibold">
            {appPlanName}
          </Text>
        </Text>
        <ProgressBar progress={progress} />
        <Text as="p">
          {newQuota} / {quota} Visitors
        </Text>
      </BlockStack>
      {isShowPopup ? (
        <div className={styles.quota_banner}>
          <br />
          <Banner title={"INFORMATION"}>
            <div className={styles.quota_banner__body}>
              <div>
                You are about to reach the visitor quota. Contact us for free to reset the usage!
              </div>
              <div className={styles.quota_banner__body__button}>
                <button onClick={(e) => handleOpenFreshChat()}>Contact us!</button>
              </div>
            </div>
          </Banner>
        </div>
      ) : null}
    </React.Fragment>
  );
}
