import { Icon } from "@shopify/polaris";
import styles from "./component.module.css";

export default function IconComponent({ source, size, type, active }) {
  let classes = `${styles.icon}`;
  if (size === "small") {
    classes += ` ${styles.small}`;
  }

  if (type === "pagination") {
    classes += ` ${styles.pagination}`;
  }

  if (active) {
    classes += ` ${styles.active}`;
  }

  return (
    <div className={classes}>
      <Icon source={source} tone="base" />
    </div>
  );
}
