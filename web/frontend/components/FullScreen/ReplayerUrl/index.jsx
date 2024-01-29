import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback } from "react";

const { TextField, Badge, Tooltip, Button, Icon } = require("@shopify/polaris");
const { ExternalMinor } = require("@shopify/polaris-icons");
import styles from "./ReplayerUrl.module.css";

const ReplayerUrl = ({
  href,
  index,
  totalIndex,
  isSave = false,
  onSave,
  loading = false,
  setToastMessage,
  setToastActive,
}) => {
  const router = useRouter();

  const handleCopyClick = useCallback(() => {
    if (!href || !navigator) return;
    navigator.clipboard.writeText(href.href);
    setToastMessage && setToastMessage("URL copied");
    setToastActive && setToastActive((prev) => !prev);
  }, [href, setToastMessage, setToastActive]);

  const handleOpenUrlClick = useCallback(() => {
    if (!href || !window) return;
    window.open(href.href, "_blank");
  }, [href]);

  return (
    <div className={styles["mida-fullbar"]}>
      <TextField
        value={href ? `${href.href}` : ""}
        autoComplete="off"
        readOnly={true}
        prefix={
          router.pathname === "/replays/[id]" ? (
            <Badge status="new">
              <b>
                TAB: {index + 1}/{totalIndex}
              </b>
            </Badge>
          ) : null
        }
      />
      <div className={styles["mida-fullbar-btn-group"]}>
        <div className={styles["mida-fullbar-btn"]}>
          <Tooltip content={"Copy URL"}>
            <Button
              icon={
                <Image src={`/images/icons/copy.svg`} width={14} height={14} alt={`copy button`} />
              }
              onClick={handleCopyClick}
              width={20}
              height={20}
            />
          </Tooltip>
        </div>
        <div className={styles["mida-fullbar-btn"]}>
          <Tooltip content={"Open URL"}>
            <Button
              icon={<Icon source={ExternalMinor} tone="base" />}
              onClick={handleOpenUrlClick}
            />
          </Tooltip>
        </div>
        {isSave ? (
          <div className={styles["mida-fullbar-btn"]}>
            <Button variant="primary" onClick={onSave} loading={loading}>
              Save
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReplayerUrl;
