import { Grid, Modal } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { SurveyCardChoice } from "..";
import { ListMajor, ThumbsDownMajor, ThumbsUpMajor } from "@shopify/polaris-icons";

export function AddSurveyModal({ active, onClose, onNext, onCancel }) {
  const [cardChoice, setCardChoice] = useState(null);

  const handleClose = useCallback(() => {
    if (!onClose) return;
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    if (!onCancel) return;
    onCancel();
  }, [onCancel]);

  const handleNext = useCallback(() => {
    if (!onNext) return;
    onNext(cardChoice);
  }, [cardChoice, onNext]);

  const handleCardChoice = useCallback((id) => {
    setCardChoice(id);
  }, []);

  return (
    <Modal
      open={active}
      onClose={handleClose}
      title="Create Surveys"
      primaryAction={{
        content: "Next",
        onAction: handleNext,
        disabled: !cardChoice,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleCancel,
        },
      ]}
    >
      <Modal.Section>
        <div className="Survey-AddModal">
          <Grid gap={{ xs: "20px" }}>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <SurveyCardChoice
                id="multiple-choice"
                active={cardChoice === "multiple-choice"}
                icon={ListMajor}
                title="Multiple choice"
                description="Useful way to explore what your customers want and attract to."
                onChoice={handleCardChoice}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <SurveyCardChoice
                id="like-dislike"
                active={cardChoice === "like-dislike"}
                icon={ThumbsUpMajor}
                subIcon={ThumbsDownMajor}
                title="Like or Dislike"
                description="One simple question. High response rate."
                onChoice={handleCardChoice}
              />
            </Grid.Cell>
          </Grid>
        </div>
      </Modal.Section>
    </Modal>
  );
}
