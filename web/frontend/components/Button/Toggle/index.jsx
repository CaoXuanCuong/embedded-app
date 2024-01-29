import styles from "./toggle.module.css";

export default function Toggle({ status, onToggle }) {
  const handleChangeStatus = (e) => {
    e.preventDefault();
    onToggle();
  };
  return (
    <div className={styles.toggle_btn} onClick={handleChangeStatus}>
      <label className={styles.toggle_btn_switch}>
        <input type="checkbox" checked={status} />
        <span className={styles.toggle_button_slider}></span>
        <span className={styles.toggle_label} data-on="ON" data-off="OFF"></span>
      </label>
    </div>
  );
}
