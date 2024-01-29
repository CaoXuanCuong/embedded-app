import VoteQuestion from "./VoteQuestion";
import TextQuestion from "./TextQuestion";
import { useCallback } from "react";
import React from "react";
import { MultipleQuestion } from "../MultipleChoice";
export default function SurveyFormPreview({ error, surveyType, surveyData, onSetSurveyData }) {
  const { questions } = surveyData;
  const questionComponent = {
    vote: VoteQuestion,
    text: TextQuestion,
    choices: MultipleQuestion,
  };

  const handleQuestionChange = useCallback(
    (index) => (value) => {
      const newQuestion = [...questions];
      newQuestion[index] = { ...newQuestion[index], ...value };
      onSetSurveyData({ questions: newQuestion });
    },
    [questions, onSetSurveyData],
  );

  return (
    <>
      {questions.map((question, index) => {
        const QuestionComponent = questionComponent[question.type];
        if (QuestionComponent) {
          const handleChangeQuestion = handleQuestionChange(index);
          return (
            <QuestionComponent
              key={index}
              error={error}
              question={question}
              onQuestionChange={handleChangeQuestion}
              surveyData={surveyData}
              surveyType={surveyType}
              onSetSurveyData={onSetSurveyData}
            />
          );
        }
      })}
    </>
  );
}
