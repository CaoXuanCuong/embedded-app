import("isomorphic-fetch");
import { ContextualSaveBar, Page, Toast } from "@shopify/polaris";
import { wrapper } from "redux/store";
import { END } from "redux-saga";
import { useDispatch, useSelector } from "react-redux";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { getSettingsAsync, saveSettingsAsync } from "redux/actions/settings.action";
import {
  selectReplaySettings,
  selectExcludeVisitorSettings,
  selectSessionSettings,
  selectFetchResult,
  selectSaveResult,
  selectSessionTarget,
  resetSaveResult,
  discardSettings,
} from "redux/reducers/settings.reducer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import FetchingPage from "components/Skeleton/FetchingPage";
import Settings from "components/Settings";

export default function SettingReplay({ jwt }) {
  const dispatch = useDispatch();
  const settings = useRef({});
  const { speed, autoplay } = useSelector(selectReplaySettings);
  const { ips, countries } = useSelector(selectExcludeVisitorSettings);
  // const { minimalDuration } = useSelector(selectSessionTarget);
  const { collectEmail, showCookiesBar, cookiesBarContent } = useSelector(selectSessionSettings);
  const fetched = useSelector(selectFetchResult);
  const saved = useSelector(selectSaveResult);

  const [fetching, setFetching] = useState(true);
  const [hasChanged, setHasChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);

  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handleSaveSettings = useCallback(async () => {
    const settingsAutoplay = autoplay === "true";
    const settingsCollectEmail = collectEmail === "true";
    const settingsShowCookiesBar = showCookiesBar === "true";
    if (
      settingsCollectEmail &&
      settingsShowCookiesBar &&
      cookiesBarContent &&
      (!cookiesBarContent.privacyPolicyUrl ||
        !cookiesBarContent.message ||
        !cookiesBarContent.okButtonText ||
        !cookiesBarContent.infoLinkText)
    ) {
      setToastMessage("Please fill out Cookie Bar GDPR fields.");
      handleToggleToast();
      return;
    }
    if (
      settingsCollectEmail &&
      settingsShowCookiesBar &&
      cookiesBarContent &&
      cookiesBarContent.privacyPolicyUrl
    ) {
      try {
        new URL(cookiesBarContent.privacyPolicyUrl);
      } catch {
        setToastMessage("Invalid Privacy Policy URL.");
        handleToggleToast();
        return;
      }
    }
    const trimmedCookieBarContent = {
      message: cookiesBarContent.message.trim(),
      privacyPolicyUrl: cookiesBarContent.privacyPolicyUrl.trim(),
      okButtonText: cookiesBarContent.okButtonText.trim(),
      infoLinkText: cookiesBarContent.infoLinkText.trim(),
    };
    setSaving(true);
    dispatch(resetSaveResult());
    dispatch(
      saveSettingsAsync({
        jwt,
        settings: {
          replay_autoplay: settingsAutoplay,
          replay_speed: parseInt(speed),
          excluded_ips: ips,
          excluded_countries: countries,
          // min_duration: minimalDuration,
          collect_email: settingsCollectEmail,
          show_cookies_bar: settingsShowCookiesBar,
          cookies_bar_content: trimmedCookieBarContent,
        },
      }),
    );
  }, [
    dispatch,
    jwt,
    autoplay,
    ips,
    countries,
    speed,
    // minimalDuration,
    collectEmail,
    handleToggleToast,
    showCookiesBar,
    cookiesBarContent,
  ]);

  useEffect(() => {
    if (saved !== null) {
      if (saving) {
        if (saved) {
          setToastMessage("Save settings successfully");
          settings.current.replay_autoplay = autoplay;
          settings.current.replay_speed = speed;
          settings.current.excluded_ips = ips;
          settings.current.excluded_countries = countries;
          // settings.current.min_duration = minimalDuration;
          settings.current.collect_email = collectEmail;
          settings.current.show_cookies_bar = showCookiesBar;
          settings.current.cookies_bar_content = cookiesBarContent;
          setHasChanged(false);
        } else {
          setToastMessage("Save settings failed");
        }
        handleToggleToast();
        setSaving(false);
      }
    }
  }, [
    autoplay,
    ips,
    countries,
    speed,
    // minimalDuration,
    collectEmail,
    showCookiesBar,
    cookiesBarContent,
    saving,
    saved,
    handleToggleToast,
    setToastMessage,
  ]);

  useEffect(() => {
    if (fetched) {
      if (fetching) {
        settings.current = {
          replay_autoplay: autoplay,
          replay_speed: speed,
          excluded_ips: ips,
          excluded_countries: countries,
          // min_duration: minimalDuration,
          collect_email: collectEmail,
          show_cookies_bar: showCookiesBar,
          cookies_bar_content: cookiesBarContent,
        };
        setFetching(false);
      }
    } else {
      dispatch(getSettingsAsync(jwt));
    }
  }, [
    autoplay,
    ips,
    countries,
    speed,
    // minimalDuration,
    collectEmail,
    showCookiesBar,
    cookiesBarContent,
    dispatch,
    fetching,
    fetched,
    jwt,
  ]);

  useEffect(() => {
    if (!fetching) {
      const compareReplaySpeed = speed === settings.current.replay_speed;
      const compareReplayAutoPlay = autoplay === settings.current.replay_autoplay;
      const compareExcludedIps = (function () {
        let result = true;
        const refs = [...settings.current.excluded_ips].sort();
        const curr = [...ips].sort();
        if (refs.length === curr.length) {
          curr.every((item, index) => {
            result = item === refs[index];
            return !result;
          });
        } else {
          result = false;
        }
        return result;
      })();
      const compareExcludedCountries = (function () {
        let refs, curr;
        refs = [...settings.current.excluded_countries].sort();
        curr = [...countries].sort();
        if (JSON.stringify(refs) === JSON.stringify(curr)) {
          return true;
        } else {
          return false;
        }
      })();
      // const compareTarget = parseInt(minimalDuration) === parseInt(settings.current.min_duration);
      const compareCollectEmail = collectEmail === settings.current.collect_email;
      const compareShowCookiesBar = showCookiesBar === settings.current.show_cookies_bar;
      const compareCookiesBarContent = (function () {
        const refs = JSON.stringify(settings.current.cookies_bar_content);
        const curr = JSON.stringify(cookiesBarContent);
        return refs === curr;
      })();
      setHasChanged(
        !compareReplaySpeed ||
          !compareReplayAutoPlay ||
          !compareExcludedIps ||
          !compareExcludedCountries ||
          // !compareTarget ||
          !compareCollectEmail ||
          !compareShowCookiesBar ||
          !compareCookiesBarContent,
      );
    }
  }, [
    fetching,
    speed,
    autoplay,
    ips,
    countries,
    // minimalDuration,
    collectEmail,
    showCookiesBar,
    cookiesBarContent,
  ]);

  return (
    <Page title="Settings">
      {fetching ? (
        <FetchingPage />
      ) : (
        <React.Fragment>
          {hasChanged ? (
            <ContextualSaveBar
              message="Unsaved changes"
              saveAction={{
                content: "Save",
                onAction: () => handleSaveSettings(),
                loading: saving,
                disabled: false,
              }}
              discardAction={{
                content: "Discard",
                onAction: () => dispatch(discardSettings(settings.current)),
              }}
            />
          ) : null}
          <Settings />
          <br />
          {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
        </React.Fragment>
      )}
    </Page>
  );
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async ({ req, res }) => {
  let jwt = req.cookies["midaJWT"];

  if (jwt) {
    if (!store.getState().general.name) {
      store.dispatch(SAGA_GET_SHOP_DATA_ASYNC(jwt));
      store.dispatch(END);
      await store.sagaTask.toPromise();
    }
    if (!store.getState().general.isAuthenticated) {
      res.writeHead(301, { Location: "/login.html" });
      res.end();
    }
  } else {
    res.writeHead(301, { Location: "/login.html" });
    res.end();
  }

  return {
    props: {
      jwt,
    },
  };
});
