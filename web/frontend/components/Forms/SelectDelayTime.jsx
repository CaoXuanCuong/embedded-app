import { InlineError, RadioButton, LegacyStack, TextField } from "@shopify/polaris";
import { useEffect, useState } from "react";
const MIN_DELAY_TIME = 3,
  MAX_DELAY_TIME = 300;
export default function SelectDelayTime({ error, surveyData, onSetSurveyData }) {
  const { delay_time, delay_time_type } = surveyData;
  const [delayTimeError, setDelayTimeError] = useState(error);
  const options = new Map();
  options.set(0, "none");
  options.set(1, "specific_time");

  useEffect(() => {
    setDelayTimeError(error);
  }, [error]);

  const valueMap = options.get(delay_time_type);

  const getKeyByValue = (searchValue) => {
    for (let [key, value] of options.entries()) {
      if (value === searchValue) return key;
    }
  };

  const handleSelectDelayTimeTypeChange = (_checked, newValue) => {
    let delay_time_type = getKeyByValue(newValue);

    if (
      !delay_time ||
      !/^\d+$/.test(delay_time) ||
      delay_time < MIN_DELAY_TIME ||
      delay_time > MAX_DELAY_TIME
    ) {
      onSetSurveyData({
        ...surveyData,
        delay_time_type,
        delay_time: MIN_DELAY_TIME,
      });
      setDelayTimeError(false);
      return;
    }

    onSetSurveyData({ delay_time_type });
  };

  const handleChangeDelayTime = (value) => {
    onSetSurveyData({
      ...surveyData,
      delay_time: value,
    });

    if (!value || !/^\d+$/.test(value) || value < MIN_DELAY_TIME || value > MAX_DELAY_TIME) {
      setDelayTimeError(true);
      return;
    }

    setDelayTimeError(false);
  };

  return (
    <LegacyStack vertical>
      <RadioButton
        label="No delay: Display survey immediately"
        checked={valueMap == "none"}
        id="none"
        name={"delay_time_type"}
        onChange={handleSelectDelayTimeTypeChange}
      />
      <RadioButton
        label={
          <span className="rule_delay_time">
            Display survey after:
            <TextField
              disabled={surveyData.delay_time_type !== 1}
              type="number"
              value={delay_time}
              onChange={handleChangeDelayTime}
              max={300}
              min={3}
              inputMode="numeric"
              autoFocus
              error={!!delayTimeError}
            />{" "}
            seconds
          </span>
        }
        checked={valueMap == "specific_time"}
        id="specific_time"
        name={"delay_time_type"}
        onChange={handleSelectDelayTimeTypeChange}
        helpText={
          !delayTimeError
            ? `Please enter an integer between ${MIN_DELAY_TIME} and ${MAX_DELAY_TIME}`
            : ""
        }
      />
      {delayTimeError && (
        <div style={{ marginLeft: "2px", marginTop: "-12px" }}>
          <InlineError
            message={`Please enter an integer between ${MIN_DELAY_TIME} and ${MAX_DELAY_TIME}`}
            fieldID="rule-priority"
          />
        </div>
      )}
    </LegacyStack>
  );
}
