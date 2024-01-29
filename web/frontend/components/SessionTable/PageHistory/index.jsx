import { Button, ButtonGroup, Icon, SkeletonBodyText, Text, Tooltip } from "@shopify/polaris";
import { AlertMinor, CancelSmallMinor, PlayMinor } from "@shopify/polaris-icons";
import TimeLineEvent from "consts/TimelineEvent.const";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import { selectSessionSelected } from "redux/reducers/sessions.reducer";
import { getCountryName } from "../../../helpers/country.helper";
import styles from "./PageHistory.module.css";
import { useRouter } from "next/router";

export default function PageHistory({ active, setActive, jwt, setRowActive }) {
  const router = useRouter();
  const session = useSelector(selectSessionSelected);
  const shop = useSelector(selectShop);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions/${session._id}/behaviors`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        },
      );
      const resJson = await res.json();
      if (resJson && resJson.payload) {
        setData(resJson.payload);
      }
    } catch (error) {
      console.log("ERROR: ", error);
    }
    setLoading(false);
  }, [session, jwt]);

  useEffect(() => {
    if (session && session._id) {
      fetchData();
    }
  }, [session, fetchData]);

  const handleClose = useCallback(() => {
    setActive(false);
    setRowActive("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayClick = useCallback(
    (item, index) => {
      const id = session._id;
      router.replace(`/replays/${id}?pageview=${index}`);
    },
    [session, router],
  );

  const classes = styles.mida_page_history + " " + (active ? styles.active : "");
  return (
    <div className={classes}>
      <div className={styles.mida_page_history_inner}>
        <div className={styles.mida_page_history_heading}>
          <Button icon={<Icon source={CancelSmallMinor} tone="base" />} onClick={handleClose} />
        </div>
        <div className={styles.mida_page_history_content}>
          {loading && (
            <>
              <SkeletonBodyText />
              <SkeletonBodyText />
              <SkeletonBodyText />
            </>
          )}
          {!loading && session && Object.keys(session).length > 0 && data && data.length > 0 && (
            <>
              <Text variant="headingLg" as="h6">
                Page History
              </Text>
              <br />
              <div>
                <Text as="p" fontWeight="regular">
                  Visitor ID: {session.visitor}
                </Text>
                <Text as="p" fontWeight="regular">
                  Location: {getCountryName(session.location)}
                </Text>
              </div>
              <br />
              <div>
                {data.map((item, index) => (
                  <div key={index} className={styles.mida_page_item}>
                    <div className={styles.mida_page_item_head}>
                      <div className={styles.mida_page_highlight}>Page #{index + 1}</div>
                      <div>
                        <ButtonGroup>
                          {!session.checkTheme && (
                            <Tooltip
                              zIndexOverride={100000000}
                              content={
                                <Text as="span" variant="bodyMd" tone="subdued">
                                  The recording is not available because the corresponding theme has
                                  been removed.
                                </Text>
                              }
                            >
                              <Icon source={AlertMinor} tone="warning" />
                            </Tooltip>
                          )}
                          {session.checkTheme && (
                            <div className="mida-alert-minor-icon">
                              <Icon source={AlertMinor} tone="warning" />
                            </div>
                          )}
                          <Button
                            disabled={!session.checkTheme}
                            icon={
                              <Icon
                                source={PlayMinor}
                                tone={session.checkTheme ? "success" : "subdued"}
                              />
                            }
                            onClick={() => handlePlayClick(item, index)}
                          >
                            Play
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                    <br />
                    <BehaviorItem data={item} shopData={shop} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BehaviorItem({ data, shopData }) {
  let content = shopData.name;

  if (data?.behaviors && data?.behaviors.length > 0) {
    const behavior = data.behaviors[0];
    if (behavior.type === TimeLineEvent.PURCHASE) {
      content = `Checkout`;
    } else {
      const type = behavior.type;
      const data = behavior.data;
      switch (type) {
        case TimeLineEvent.VIEW_PRODUCT:
          content = data.name;
          break;
        case TimeLineEvent.VIEW_COLLECTION:
          content = data.name;
          break;
        case TimeLineEvent.VIEW_CART:
          content = `Your Shopping Car - ${shopData.name}`;
          break;
      }
    }
  }

  return (
    <>
      <div className={styles.mida_page_item_heading}>{content}</div>
      <div className={styles.mida_page_item_url}>
        <a href={data.href} target="_blank" rel="noreferrer">
          {new URL(data.href).pathname}
        </a>
      </div>
    </>
  );
}
