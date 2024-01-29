import {
  Badge,
  Button,
  Icon,
  SkeletonBodyText,
  SkeletonDisplayText,
  TextContainer,
} from "@shopify/polaris";
import {
  ChevronLeftMinor,
  ChevronRightMinor,
  PlayMinor,
  ReplayMinor,
} from "@shopify/polaris-icons";
import { getCountryName } from "helpers/country.helper";
import { convertDurationToMmSs } from "helpers/time.helper";
import { useCallback } from "react";
import styles from "./Replayer.module.css";

export default function Pagination({
  list,
  active,
  onClick,
  fullWidth,
  hasPrevious,
  hasNext,
  setCurrentPage,
  loading,
}) {
  const handlePlay = useCallback(
    (_id) => {
      if (!onClick) return;
      let isActive = _id === active ? true : false;
      onClick(_id, isActive);
    },
    [onClick, active],
  );

  const handlePrev = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [setCurrentPage, hasPrevious]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [setCurrentPage, hasNext]);

  return (
    <div className={styles.msr_wrapper_pagination}>
      <div
        className={`${styles.msr_pagination_button} ${
          (!hasPrevious || loading) && styles.msr_pagination_button__disable
        }`}
        onClick={hasPrevious || loading ? handlePrev : null}
      >
        <Icon source={ChevronLeftMinor} tone="base" />
      </div>
      <div
        className={`${styles.msr_pagination__container} ${
          fullWidth ? styles.msr_pagination__container__full : ""
        }`}
      >
        {loading && (
          <div style={{ width: "100%" }}>
            <SkeletonBodyText />
            <SkeletonBodyText />
          </div>
        )}
        {!loading &&
          list.length > 0 &&
          list.map(
            ({ _id, duration, viewed, createdAt, os, browser, device, location, session }) => {
              let formatDate = new Date(createdAt);
              const country = getCountryName(location || session.location);

              return (
                <div
                  key={_id}
                  className={`${styles.msr_pagination_item} ${
                    _id === active && styles.msr_pagination_item__active
                  }`}
                >
                  <div className={styles.msr_item_content}>
                    <div className={styles.msr_item_date}>
                      {formatDate.toLocaleDateString("en-US")} |&nbsp;
                      {formatDate.toLocaleTimeString("en-US", { hour12: false })} |&nbsp;
                      {convertDurationToMmSs(duration)}
                    </div>
                    <div className={styles.msr_item_icon}>
                      <Badge tone="info" size="small">
                        {os || session.os}
                      </Badge>
                      &nbsp;
                      <Badge tone="info" size="small">
                        {browser || session.os}
                      </Badge>
                      &nbsp;
                      <Badge tone="info" size="small">
                        {device || session.device}
                      </Badge>
                    </div>
                    <div className={styles.msr_item_icon}>
                      <Badge tone="info" size="small">
                        {country}
                      </Badge>
                    </div>
                    <Button
                      icon={<Icon source={viewed ? ReplayMinor : PlayMinor} tone="success" />}
                      onClick={() => handlePlay(_id)}
                    >
                      {viewed ? "Replay" : "Play"}
                    </Button>
                  </div>
                </div>
              );
            },
          )}
      </div>

      <div
        className={`${styles.msr_pagination_button} ${
          (!hasNext || loading) && styles.msr_pagination_button__disable
        }`}
        onClick={hasNext || loading ? handleNext : null}
      >
        <Icon source={ChevronRightMinor} tone="base" />
      </div>
    </div>
  );
}
