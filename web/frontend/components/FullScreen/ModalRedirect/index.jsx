import { Modal, TextContainer } from "@shopify/polaris";
import { useCallback } from "react";
import styles from "./ModalRedirect.module.css";

const ModalRedirect = ({ active, setActive, onRedirect, onClose }) => {
  const handleChange = useCallback(() => setActive(!active), [active]);

  return (
    <div className={styles.ModalRedirect}>
      <Modal
        open={active}
        onClose={handleChange}
        title="Leave page with unsaved changes?"
        primaryAction={{
          destructive: true,
          content: "Leave page",
          onAction: onRedirect,
        }}
        secondaryActions={[
          {
            content: "Stay",
            onAction: onClose,
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>Leaving this page will delete all unsaved changes.</p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </div>
  );
};

export default ModalRedirect;
