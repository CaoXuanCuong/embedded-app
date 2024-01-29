import styles from "./Visitor.module.css";
import { Icon } from "@shopify/polaris";
import { ProfileMajor, EmailMajor, CalendarTimeMinor } from "@shopify/polaris-icons";

export default function VisitorInformation({ visitorID, customerEmail, visitorLastActive }) {
  return (
    <div>
      <div className={styles.information_header}>User properties</div>
      <div className={styles.information_item}>
        <span>
          <Icon source={ProfileMajor} tone="base" />
        </span>
        <span>{visitorID}</span>
      </div>
      <div className={styles.information_item}>
        <span>
          <Icon source={EmailMajor} tone="base" />
        </span>
        <span>{customerEmail ? customerEmail : "Guest"}</span>
      </div>
      <div className={styles.information_item}>
        <span>
          <Icon source={CalendarTimeMinor} tone="base" />
        </span>
        <span>{visitorLastActive}</span>
      </div>
    </div>
  );
}
