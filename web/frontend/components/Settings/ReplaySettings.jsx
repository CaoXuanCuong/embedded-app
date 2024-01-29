import { useCallback } from "react";
import { Card, FormLayout, Layout, Select } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import { selectReplaySettings, setAutoplay, setSpeed } from "redux/reducers/settings.reducer";

export default function ReplaySettings() {
  const dispatch = useDispatch();
  const { autoplay: replayAutoplay, speed: replaySpeed } = useSelector(selectReplaySettings);

  const replaySpeedOptions = [
    { label: "1x", value: "1" },
    { label: "2x", value: "2" },
    { label: "4x", value: "4" },
    { label: "8x", value: "8" },
  ];

  const replayAutoplayOptions = [
    { label: "Enabled", value: "true" },
    { label: "Disabled", value: "false" },
  ];

  const handleChangeReplaySpeed = useCallback(
    (value) => {
      dispatch(setSpeed(value));
    },
    [dispatch],
  );

  const handleChangeReplayAutoplay = useCallback(
    (value) => {
      dispatch(setAutoplay(value));
    },
    [dispatch],
  );

  return (
    <Layout.AnnotatedSection
      title="Replay settings"
      description="Change the default replayer speed and autoplay settings"
    >
      <Card>
        <FormLayout>
          <FormLayout.Group>
            <Select
              label="Speed"
              value={replaySpeed}
              options={replaySpeedOptions}
              onChange={handleChangeReplaySpeed}
            />
            <Select
              label="Autoplay"
              value={replayAutoplay}
              options={replayAutoplayOptions}
              onChange={handleChangeReplayAutoplay}
            />
          </FormLayout.Group>
        </FormLayout>
      </Card>
    </Layout.AnnotatedSection>
  );
}
