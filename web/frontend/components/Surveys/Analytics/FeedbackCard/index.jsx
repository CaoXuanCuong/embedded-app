import { Button, Divider, Icon, Tooltip } from "@shopify/polaris";
import styles from "./FeedbackCard.module.css";
import { PlayMinor, ReplayMinor } from "@shopify/polaris-icons";
import { formatDateLocale } from "helpers/time.helper";
import { getCountryName } from "helpers/country.helper";
import { useRouter } from "next/router";

export function FeedbackCard({ data }) {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.visitor}>{data?.visitorId}</div>
        <div className={styles.location}>{getCountryName(data?.location)}</div>
      </div>
      <Divider borderColor="border" />
      <div className={styles.content}>
        <p className={styles.feedback}>{data?.text}</p>
      </div>
      <Divider borderColor="border" />

      <div className={styles.footer}>
        <div className={styles.time}>{formatDateLocale(data?.createdAt)}</div>
        {data?.sessionInfo?._id ? (
          <Button
            icon={
              <Icon source={data?.sessionInfo?.viewed ? ReplayMinor : PlayMinor} tone="success" />
            }
            onClick={() => {
              router.push(`/replays/${data?.sessionId}`);
            }}
          >
            {data?.sessionInfo?.viewed ? "Replay" : "Play"}
          </Button>
        ) : (
          <Tooltip content="Session has been deleted">
            <Button
              icon={
                <Icon source={data?.sessionInfo?.viewed ? ReplayMinor : PlayMinor} tone="base" />
              }
              disabled
            >
              {data?.sessionInfo?.viewed ? "Replay" : "Play"}
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
