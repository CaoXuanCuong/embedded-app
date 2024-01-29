import {
  LegacyCard,
  FormLayout,
  Layout,
  RadioButton,
  LegacyStack,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSessionSettings,
  setCollectEmail,
  setShowCookiesBar,
  setCookiesBarContent,
} from "redux/reducers/settings.reducer";
import { selectShop } from "redux/reducers/general.reducer";

export default function SessionSettings() {
  const collectEmailOptions = [
    {
      label: "Yes",
      value: "true",
      helpText: "If you tick Yes, our app will start to collect email of customer sessions.",
    },
    {
      label: "No",
      value: "false",
      helpText:
        "If you tick No, our app will not collect email of customer sessions. Emails will be also deleted if our app has collected before.",
    },
  ];

  const showCookiesBarOptions = [
    {
      label: "Yes",
      value: "true",
      helpText: "",
    },
    {
      label: "No",
      value: "false",
      helpText: "",
    },
  ];

  const dispatch = useDispatch();
  const {
    collectEmail: collectEmailSelectedOption,
    showCookiesBar: showCookiesBarSelectedOption,
    cookiesBarContent,
  } = useSelector(selectSessionSettings);
  const { myshopifyDomain } = useSelector(selectShop);

  const [privacyPolicyUrlError, setPrivacyPolicyUrlError] = useState(null);

  const handleChangeCollectEmail = useCallback(
    (_checked, newValue) => {
      const extractedValue = newValue.split("collect_email_").join("");
      dispatch(setCollectEmail(extractedValue));
    },
    [dispatch],
  );

  const handleChangeShowCookiesBar = useCallback(
    (_checked, newValue) => {
      const extractedValue = newValue.split("show_cookies_bar_").join("");
      dispatch(setShowCookiesBar(extractedValue));
    },
    [dispatch],
  );

  const handleChangeCookiesBarContent = useCallback(
    (key, value) => {
      if (key === "privacyPolicyUrl") {
        setPrivacyPolicyUrlError(null);
        try {
          new URL(value.trim());
        } catch {
          setPrivacyPolicyUrlError("Invalid URL.");
        }
      }
      dispatch(setCookiesBarContent({ key, value }));
    },
    [dispatch],
  );

  return (
    <Layout.AnnotatedSection title={"Session settings"} description={""}>
      <LegacyCard sectioned title={"Collect customers' email when recording session"}>
        <FormLayout>
          <LegacyStack vertical>
            {collectEmailOptions.map((option) => (
              <RadioButton
                key={`${option.label.toLowerCase()}-${option.value}`}
                label={option.label}
                helpText={option.helpText}
                checked={collectEmailSelectedOption === option.value}
                id={`collect_email_${option.value}`}
                name={`Radio button - Collect email - ${option.label}`}
                onChange={handleChangeCollectEmail}
              />
            ))}
          </LegacyStack>
        </FormLayout>
      </LegacyCard>
      {collectEmailSelectedOption === "true" ? (
        <LegacyCard sectioned title={"Cookies Bar GDPR"}>
          <FormLayout>
            <LegacyStack vertical>
              {showCookiesBarOptions.map((option) => (
                <RadioButton
                  key={`${option.label.toLowerCase()}-${option.value}`}
                  label={option.label}
                  helpText={option.helpText}
                  checked={showCookiesBarSelectedOption === option.value}
                  id={`show_cookies_bar_${option.value}`}
                  name={`Radio button - Show cookies GDPR bar - ${option.label}`}
                  onChange={handleChangeShowCookiesBar}
                />
              ))}
            </LegacyStack>
          </FormLayout>
          {showCookiesBarSelectedOption === "true" ? (
            <>
              <br />
              <FormLayout>
                <TextField
                  label={"Message"}
                  value={cookiesBarContent.message}
                  onChange={(value) => handleChangeCookiesBarContent("message", value)}
                  placeholder={
                    "Website uses cookies to ensure you get best the best experience on our website."
                  }
                  requiredIndicator={true}
                  autoComplete={"off"}
                />
                <TextField
                  label={"Privacy Policy URL"}
                  value={cookiesBarContent.privacyPolicyUrl}
                  onChange={(value) => handleChangeCookiesBarContent("privacyPolicyUrl", value)}
                  placeholder={`https://${myshopifyDomain}/pages/privacy-policy`}
                  error={privacyPolicyUrlError}
                  requiredIndicator={true}
                  autoComplete={"off"}
                />
                <TextField
                  label={"OK Button Text"}
                  value={cookiesBarContent.okButtonText}
                  onChange={(value) => handleChangeCookiesBarContent("okButtonText", value)}
                  placeholder={"Accept"}
                  requiredIndicator={true}
                  autoComplete={"off"}
                />
                <TextField
                  label={"Info Link Text"}
                  value={cookiesBarContent.infoLinkText}
                  onChange={(value) => handleChangeCookiesBarContent("infoLinkText", value)}
                  placeholder={"Learn more"}
                  requiredIndicator={true}
                  autoComplete={"off"}
                />
              </FormLayout>
            </>
          ) : null}
        </LegacyCard>
      ) : null}
    </Layout.AnnotatedSection>
  );
}
