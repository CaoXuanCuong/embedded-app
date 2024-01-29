import { Checkbox, FormLayout, Grid, TextField } from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChoiceOption, ChoicePreview } from "..";
import styles from "./MultipleQuestion.module.css";

export function MultipleQuestion({ error, question, onQuestionChange }) {
  const [requiredQuestion, setRequiredQuestion] = useState(error.choiceQuestion);

  useEffect(() => {
    setRequiredQuestion(error.choiceQuestion);
  }, [error]);

  const choiceOptions = useMemo(() => {
    return question?.options?.map((item, index) => {
      return { id: index, label: item, text: item, value: `option-${index}` };
    });
  }, [question]);

  const handleChoiceChange = useCallback(
    (newChoice) => {
      if (!onQuestionChange) return;
      const newOptions = newChoice?.map((item) => item?.text || "");
      onQuestionChange({ ...question, options: newOptions });
    },
    [question, onQuestionChange],
  );

  const handleQuestionChange = useCallback(
    (newValue) => {
      if (!onQuestionChange) return;
      onQuestionChange({ ...question, heading: newValue });
      if (!newValue) {
        setRequiredQuestion("Required field");
        return;
      }

      setRequiredQuestion(undefined);
    },
    [question, onQuestionChange],
  );

  const handleHelpChange = useCallback(
    (newValue) => {
      if (!onQuestionChange) return;
      onQuestionChange({ ...question, body: newValue });
    },
    [question, onQuestionChange],
  );

  const handleAllowMultiple = useCallback(
    (newChecked) => {
      if (!onQuestionChange) return;
      onQuestionChange({ ...question, multiple: newChecked });
    },
    [question, onQuestionChange],
  );

  return (
    <div className={styles.container}>
      <Grid gap={{ xs: "20px", lg: "20px", xl: "20px" }}>
        <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
          <div className={styles.question}>
            <div className={styles.heading}>
              <div>Question</div>
            </div>
            <div className={styles.form}>
              <FormLayout>
                <TextField
                  label="Question"
                  value={question?.heading}
                  multiline={3}
                  placeholder="Enter your question here"
                  maxLength={150}
                  showCharacterCount={question?.heading?.length > 0}
                  onChange={handleQuestionChange}
                  error={requiredQuestion}
                />
                <TextField
                  label="Help text"
                  value={question?.body}
                  onChange={handleHelpChange}
                  maxLength={100}
                  showCharacterCount={question?.body?.length > 0}
                  autoComplete="off"
                />
              </FormLayout>
            </div>
            <div className={styles.choices}>
              <ChoiceOption
                title="Choices"
                required={error?.choiceOption}
                choices={choiceOptions}
                min={2}
                max={5}
                onChange={handleChoiceChange}
              />
            </div>
            <div className={styles.footer}>
              <Checkbox
                label="Allow multiple answers to be selected"
                checked={question?.multiple}
                onChange={handleAllowMultiple}
              />
            </div>
          </div>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
          <div className={styles.preview}>
            <ChoicePreview
              title={question?.heading}
              helpText={question?.body}
              choices={choiceOptions}
              multiple={question?.multiple}
            />
          </div>
        </Grid.Cell>
      </Grid>
    </div>
  );
}
