import { useCallback, useEffect, useState } from "react";
import styles from "./ChoicePreview.module.css";
import { ChoiceList, Icon } from "@shopify/polaris";
import { CancelSmallMinor } from "@shopify/polaris-icons";

export function ChoicePreview({ choices, multiple, title, helpText }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!choices || choices.length === 0) {
      return;
    }
    if (!multiple) {
      setSelected([choices[0].value]);
    }
  }, [choices, multiple]);

  const handleChoiceChange = useCallback((value) => {
    setSelected(value);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.info}>Preview</div>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.preview}>
          <div className={styles.group}>
            <div className={styles.title}>{title}</div>
            <div className={styles.close}>
              <Icon source={CancelSmallMinor} tone="base" />
            </div>
          </div>
          <div className={styles.helper}>{helpText}</div>
          <div className={styles.list}>
            <ChoiceList
              allowMultiple={multiple}
              choices={choices}
              selected={selected}
              onChange={handleChoiceChange}
            />
          </div>
          <button className={styles.send}>Send</button>
        </div>
      </div>
    </div>
  );
}
