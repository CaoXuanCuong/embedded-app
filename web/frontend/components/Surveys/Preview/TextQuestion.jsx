import { Grid, Icon, TextField, Button, Divider, Box, Text, InlineStack } from "@shopify/polaris";
import { CancelSmallMinor, ThumbsDownMajor, ThumbsUpMajor } from "@shopify/polaris-icons";
import styles from "../Survey.module.css";
import Toggle from "components/Button/Toggle";

export default function TextQuestion({
  question: { heading, placeholder, headingDisLike, placeholderDisLike },
  onQuestionChange,
  surveyData,
  surveyType,
  onSetSurveyData,
}) {
  return (
    <div className={styles.text_container}>
      <Grid gap={{ xs: "20px", lg: "20px", xl: "20px" }}>
        <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
          <div className={styles.text_question}>
            <div className={styles.heading}>
              <div className={styles.text_title}>
                Thank you page
                {surveyData.feedbackOptions && <Icon source={ThumbsUpMajor} tone="base" />}
              </div>
            </div>
            <div className={styles.form_input}>
              <TextField
                label="Heading"
                value={heading}
                onChange={(value) => onQuestionChange({ heading: value })}
                autoComplete="off"
              />
              <TextField
                label="Feedback Placeholder"
                value={placeholder}
                onChange={(value) => onQuestionChange({ placeholder: value })}
                autoComplete="off"
              />
              {surveyType === "like-or-dislike" ? (
                <>
                  <br></br>
                  <Divider />
                  <br></br>
                  <InlineStack gap={200} align="start" blockAlign="center">
                    <Toggle
                      status={surveyData.feedbackOptions}
                      onToggle={() => {
                        onSetSurveyData({ feedbackOptions: !surveyData.feedbackOptions });
                        setTimeout(() => {
                          window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth",
                          });
                        }, 100);
                      }}
                    />
                    <Text variant="bodyMd" tone="subdued">
                      Show a different message when feedback is Dislike{" "}
                    </Text>
                  </InlineStack>
                </>
              ) : null}
            </div>
          </div>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
          <div className={styles.text_preview}>
            <div className={styles.heading}>
              <div className={styles.info}>Preview</div>
            </div>

            <div className={styles.wrapper}>
              <div className={styles.preview}>
                <div className={styles.group}>
                  <div className={styles.title}>{heading}</div>
                  <div className={styles.close}>
                    <Icon source={CancelSmallMinor} tone="base" />
                  </div>
                </div>
                <div className={styles.input}>
                  <TextField multiline={3} placeholder={placeholder} />
                </div>
                <button className={styles.send}>Send</button>
              </div>
            </div>
          </div>
        </Grid.Cell>

        {surveyType === "like-or-dislike" && surveyData.feedbackOptions ? (
          <>
            <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
              <div className={styles.text_question}>
                <div className={styles.heading}>
                  <div className={styles.text_title}>
                    Thank you page
                    {surveyData.feedbackOptions && <Icon source={ThumbsDownMajor} tone="base" />}
                  </div>
                </div>
                <div className={styles.form_input}>
                  <TextField
                    label="Heading"
                    value={headingDisLike}
                    onChange={(value) => onQuestionChange({ headingDisLike: value })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Feedback Placeholder"
                    value={placeholderDisLike}
                    onChange={(value) => onQuestionChange({ placeholderDisLike: value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
              <div className={styles.text_preview}>
                <div className={styles.heading}>
                  <div className={styles.info}>Preview</div>
                </div>

                <div className={styles.wrapper}>
                  <div className={styles.preview}>
                    <div className={styles.group}>
                      <div className={styles.title}>{headingDisLike}</div>
                      <div className={styles.close}>
                        <Icon source={CancelSmallMinor} tone="base" />
                      </div>
                    </div>
                    <div className={styles.input}>
                      <TextField multiline={3} placeholder={placeholderDisLike} />
                    </div>
                    <button className={styles.send}>Send</button>
                  </div>
                </div>
              </div>
            </Grid.Cell>
          </>
        ) : null}
      </Grid>
    </div>
  );
}
