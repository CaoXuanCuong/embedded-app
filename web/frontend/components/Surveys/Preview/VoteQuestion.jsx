import { Grid, Icon, TextField } from "@shopify/polaris";
import { CancelSmallMinor } from "@shopify/polaris-icons";
import ImageComponent from "components/ImageComponent";
import { getSurveyOptionImage } from "helpers/image.helper";
import styles from "../Survey.module.css";
export default function VoteQuestion({ question: { heading, body }, onQuestionChange }) {
  return (
    <Grid gap={{ xs: "20px", lg: "20px", xl: "20px" }}>
      <Grid.Cell columnSpan={{ xs: 6, lg: 6 }}>
        <div className={styles.text_question}>
          <div className={styles.heading}>
            <div>Question page</div>
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
              value={body}
              onChange={(value) => onQuestionChange({ body: value })}
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
                <div className={styles.title}>{heading}</div>
                <div className={styles.close}>
                  <Icon source={CancelSmallMinor} tone="base" />
                </div>
              </div>
              <div className={styles.input}>{body}</div>
              <div className={styles.like}>
                <div className="mida-srr-survey__vote">
                  <div className="mida-srr-survey__vote_section mida-srr-survey__thumb_up">
                    <ImageComponent
                      loader={getSurveyOptionImage}
                      src="Like"
                      width={35}
                      height={35}
                    />
                  </div>
                  <div className="mida-srr-survey__vote_section mida-srr-survey__thumb_down">
                    <ImageComponent
                      loader={getSurveyOptionImage}
                      src="Dislike"
                      width={35}
                      height={35}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Grid.Cell>
    </Grid>

    // <Card sectioned>
    //   <div className={styles.container}>
    //     <div className={styles.form_survey}>
    //       <div className={styles.section}>
    //         <h2 className={styles.form_title}>Question page</h2>
    //         <div className={styles.form_input}>
    //           <TextField
    //             label="Heading"
    //             value={heading}
    //             onChange={(value) => onQuestionChange({ heading: value })}
    //             autoComplete="off"
    //           />
    //           <TextField
    //             label="Sub heading"
    //             value={body}
    //             onChange={(value) => onQuestionChange({ body: value })}
    //             autoComplete="off"
    //           />
    //         </div>
    //       </div>
    //     </div>
    //     <div className={styles.preview_survey}>
    //       <h2 className={styles.form_title}>Preview</h2>
    //       <div className="mida-srr-survey_root">
    //         <div className="mida-srr-survey">
    //           <div className="mida-srr-survey__container">
    //             <div className="mida-srr-survey__heading">
    //               <Icon source={CancelSmallMinor} tone="base" />
    //             </div>
    //             <div className="mida-srr-survey__content">
    //               <h2 className="mida-srr-survey__question_heading">{heading}</h2>
    //               <p className="mida-srr-survey__question_body">{body}</p>
    //               <div className="mida-srr-survey__vote">
    //                 <div className="mida-srr-survey__vote_section mida-srr-survey__thumb_up">
    //                   <ImageComponent
    //                     loader={getSurveyOptionImage}
    //                     src="Like"
    //                     width={35}
    //                     height={35}
    //                   />
    //                 </div>
    //                 <div className="mida-srr-survey__vote_section mida-srr-survey__thumb_down">
    //                   <ImageComponent
    //                     loader={getSurveyOptionImage}
    //                     src="Dislike"
    //                     width={35}
    //                     height={35}
    //                   />
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </Card>
  );
}
