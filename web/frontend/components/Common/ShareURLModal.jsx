import { Button, Modal, TextContainer, TextField } from "@shopify/polaris";
import { SendMajor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";

export default function ShareURLModal({ name, url, onToggleToast, onToastMessage }) {
  const [active, setActive] = useState(false);

  const toggleModal = useCallback(() => setActive((active) => !active), []);

  const activator = (
    <Button icon={SendMajor} onClick={toggleModal} ariaDescribedBy="reversed" size="slim">
      Share
    </Button>
  );

  const handleCopyToClipboard = useCallback(() => {
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(url);
    } else {
      document.execCommand("copy", true, url);
    }
    onToastMessage("Copied");
    onToggleToast();
  }, [onToggleToast, onToastMessage, url]);

  return (
    <Modal
      activator={activator}
      open={active}
      onClose={toggleModal}
      title="Share Link"
      primaryAction={{
        content: "Done",
        onAction: toggleModal,
      }}
      secondaryActions={[
        {
          content: "Close",
          onAction: toggleModal,
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p>Anyone with this link can view this {name}.</p>
          <p>
            <TextField
              readOnly={true}
              value={url}
              autoComplete="off"
              connectedRight={<Button onClick={handleCopyToClipboard}>Copy</Button>}
            />
          </p>
        </TextContainer>
      </Modal.Section>
    </Modal>
  );
}
