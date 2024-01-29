import { LegacyStack, RadioButton } from "@shopify/polaris";

export default function SelectPosition({ surveyData, onSetSurveyData }) {
  const { position } = surveyData;
  const options = new Map();
  options.set(0, "right_bottom");
  options.set(1, "left_bottom");

  const valueMap = options.get(position);

  const getKeyMapByValue = (searchValue) => {
    for (let [key, value] of options.entries()) {
      if (value === searchValue) return key;
    }
  };
  const handleSelectPositionTypeChange = (_checked, newValue) => {
    let position = getKeyMapByValue(newValue);
    onSetSurveyData({ position });
  };

  return (
    <LegacyStack vertical>
      <RadioButton
        label="Right bottom"
        checked={valueMap == "right_bottom"}
        id="right_bottom"
        name={"popup_position_type"}
        onChange={handleSelectPositionTypeChange}
      />
      <RadioButton
        label="Left bottom"
        checked={valueMap == "left_bottom"}
        id="left_bottom"
        name={"popup_position_type"}
        onChange={handleSelectPositionTypeChange}
      />
    </LegacyStack>
  );
}
