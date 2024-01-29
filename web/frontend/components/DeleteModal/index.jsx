import { Modal } from "@shopify/polaris";
import { useMemo } from "react";

export default function DeleteModal({
  resource,
  resourceId,
  resourceName,
  active,
  onClose,
  loading,
  onAction,
}) {
  const itemDeleted = useMemo(() => {
    let text = "";
    if (resourceId) {
      text += `#${resourceId}`;
    } else if (resourceName) {
      text += resourceName;
    }
    return <b>{text}</b>;
  }, [resourceId, resourceName]);
  return (
    <Modal
      open={active}
      title={`Delete ${resource.toLowerCase()}`}
      onClose={onClose}
      primaryAction={{
        destructive: true,
        content: "Delete",
        onAction: onAction,
        loading: loading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
          disabled: loading,
        },
      ]}
    >
      <Modal.Section>
        <p>
          Are you sure to delete {resource.toLowerCase()} {itemDeleted}?
        </p>
      </Modal.Section>
    </Modal>
  );
}
