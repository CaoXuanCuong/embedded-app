import { getCountryName } from "helpers/country.helper";
import {
  getCountryImage,
  getBrowserImage,
  getOSImage,
  getDeviceTypeImage,
} from "helpers/image.helper";
import styles from "./System.module.css";
import { Icon, Tag } from "@shopify/polaris";
import { CalendarMinor, ProductsMinor } from "@shopify/polaris-icons";
import Image from "next/image";
import IpIcon from "../../public/images/browsers/IP.svg";
import { useCallback } from "react";

export default function SystemInformation({
  createdDate,
  deviceLocation,
  deviceOS,
  deviceBrowser,
  deviceType,
  sessionIp,
  pageviewTags,
  sessionTags,
}) {
  const tags = sessionTags || pageviewTags;
  const handleAddTag = useCallback(() => {}, []);

  return (
    <div>
      <div className={styles.information_header}>Session properties</div>
      <div className={styles.information_item}>
        <span>
          <Icon source={CalendarMinor} tone="base" />
        </span>
        <span>{createdDate}</span>
      </div>
      <div className={styles.information_item}>
        <span class={styles.item_img} style={{ marginLeft: "3px", marginRight: "9px" }}>
          <Image
            src={getCountryImage({ src: deviceLocation })}
            width="16"
            height="16"
            alt="country"
          />
        </span>
        <span>{getCountryName(deviceLocation)}</span>
      </div>
      <div className={styles.information_item}>
        <span class={styles.item_img} style={{ marginRight: "8px" }}>
          <Icon source={getDeviceTypeImage(deviceType)} />
        </span>
        <span>{deviceType}</span>
      </div>
      <div className={styles.information_item}>
        <span class={styles.item_img} style={{ marginLeft: "3px", marginRight: "9px" }}>
          <Image src={getOSImage({ src: deviceOS })} width="16" height="16" alt="OS" />
        </span>
        <span>{deviceOS}</span>
      </div>
      <div className={styles.information_item}>
        <span class={styles.item_img} style={{ marginRight: "9px" }}>
          <Image
            src={getBrowserImage({ src: deviceBrowser })}
            width="20"
            height="20"
            alt="Browser"
          />
        </span>
        <span>{deviceBrowser}</span>
      </div>
      <div className={styles.information_item}>
        <span>
          <Image src={IpIcon} width="24" height="18" alt="Browser" />
        </span>
        <span className={styles.ip_bg}>{sessionIp}</span>
      </div>
      <div className={styles.information_item} style={{ alignItems: "flex-start" }}>
        <span style={{ marginTop: "2px", marginRight: "9px" }}>
          <Icon source={ProductsMinor} />
        </span>
        <div className={styles.tag_container}>
          <div>
            {tags.map((tag, idx) => {
              return (
                <span key={idx} className={styles.tag_item}>
                  {" "}
                  <Tag>{tag}</Tag>{" "}
                </span>
              );
            })}
          </div>
          {/* <span className={styles.add_tag_btn} onClick={handleAddTag}>
            Edit tags
          </span> */}
        </div>
      </div>
    </div>
  );
}
