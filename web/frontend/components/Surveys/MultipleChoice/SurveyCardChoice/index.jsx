import { useCallback } from "react";
import styles from "./SurveyCardChoice.module.css";
import { Icon } from "@shopify/polaris";

export function SurveyCardChoice({ id, active, icon, subIcon, title, description, onChoice }) {
  const handleCardChoice = useCallback(() => {
    if (!onChoice) return;
    onChoice(id);
  }, [onChoice]);

  return (
    <div className={styles.container} data-active={active} onClick={handleCardChoice}>
      <div className={styles.icon}>
        <Icon source={icon} />
        {subIcon ? <Icon source={subIcon} /> : null}
      </div>

      <div className={styles.title}>{title}</div>

      <div className={styles.desc}>{description}</div>
    </div>
  );
}
