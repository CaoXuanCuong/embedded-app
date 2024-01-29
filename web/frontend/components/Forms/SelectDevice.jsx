import { ChoiceList, LegacyStack } from "@shopify/polaris";

export default function SelectDevice({ surveyData: { apply_devices }, onSetSurveyData }) {
  const listDeviceOptions = [
    {
      label: "Desktop",
      value: "Desktop",
    },
    {
      label: "Tablet",
      value: "Tablet",
    },
    {
      label: "Mobile",
      value: "Mobile",
    },
  ];

  return (
    <LegacyStack vertical>
      <ChoiceList
        allowMultiple
        choices={listDeviceOptions}
        selected={apply_devices}
        onChange={(value) => {
          onSetSurveyData({ apply_devices: value });
        }}
      />
    </LegacyStack>
  );
}
