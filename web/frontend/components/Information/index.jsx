import styles from "./component.module.css";

export default function Information({ heading, content, children }) {
  return (
    <div className={styles.mida_ci}>
      <span>
        {heading}: {content ?? null}
      </span>
      {children ?? null}
    </div>
  );
}
