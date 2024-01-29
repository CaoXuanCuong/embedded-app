import { LegacyCard, Layout, TextField } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSessionTarget, setMinimalDuration } from "redux/reducers/settings.reducer";

export default function SessionTarget() {
  const { minimalDuration: value } = useSelector(selectSessionTarget);

  const dispatch = useDispatch();

  const [textError, setTextError] = useState("");

  const handleChange = useCallback(
    (newValue) => {
      if (!isNaN(newValue)) {
        if (newValue >= 0) {
          dispatch(setMinimalDuration(newValue));
          setTextError("");
        } else setTextError("Number must be greater or equal '0'");
      }
    },
    [dispatch],
  );
  return (
    <Layout.AnnotatedSection title={"Session Targeting"} description={""}>
      <LegacyCard
        sectioned
        title={"Only record the session when the duration is longer than the preset interval"}
      >
        <TextField
          label="Time (Second)"
          type="number"
          value={value}
          onChange={handleChange}
          error={textError}
          autoComplete="off"
        />
      </LegacyCard>
    </Layout.AnnotatedSection>
  );
}
