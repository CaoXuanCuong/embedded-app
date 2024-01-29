import("isomorphic-fetch");
import {
  Button,
  Scrollable,
  Layout,
  Page,
  Toast,
  Modal,
  FormLayout,
  Select,
  TextField,
  ButtonGroup,
  InlineStack,
  Box,
  Text,
  BlockStack,
  Divider,
} from "@shopify/polaris";
import { wrapper } from "redux/store";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import FetchingPage from "components/Skeleton/FetchingPage";
import {
  REASON_OPTIONS,
  HelpEmail,
  REASON_DATA,
  ReasonOptions,
  InitialModalState,
} from "consts/Unsubscribe.const";
import PlanHeader from "components/BFCM/PlanHeader";
export default function Plans({ jwt }) {
  const router = useRouter();
  const { appPlanCode, sub_bfcm } = useSelector(selectShop);
  const [fetching, setFetching] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [activeUnsubModal, setActiveUnsubModal] = useState(false);
  const [reasonDescription, setReasonDescription] = useState("");
  const [modalSetting, setModalSetting] = useState(InitialModalState.CONTACT_SUPPORT);
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS.DEFAULT);
  const applyBfcm = process.env.NEXT_PUBLIC_APPLY_BFCM === "true";

  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handleSelectChange = useCallback((newValue) => {
    setSelectedReason(newValue);
  }, []);

  const handleChangeReasonDescription = useCallback(
    (newValue) => setReasonDescription(newValue),
    [],
  );

  const setModalData = useCallback((type) => {
    switch (type) {
      case "contact_support_modal":
        setModalSetting((data) => ({
          ...data,
          ...InitialModalState.CONTACT_SUPPORT,
        }));
        break;
      case "feedback_modal":
        setModalSetting((data) => ({
          ...data,
          ...InitialModalState.FEEDBACK,
        }));
        break;
      case "unsubscribe_modal":
        setModalSetting((data) => ({
          ...data,
          ...InitialModalState.UNSUBSCRIBE,
        }));
        break;
      default:
        setModalSetting((data) => ({
          ...data,
          ...InitialModalState.CONTACT_SUPPORT,
        }));
    }
  }, []);

  const getModalData = () => {
    switch (modalSetting.type) {
      case "contact_support_modal":
        return contactSupModal;
      case "feedback_modal":
        return feedBackModal;
      case "unsubscribe_modal":
        return unsubscribeModal;
      default:
        return contactSupModal;
    }
  };

  const handleEmailRedirect = useCallback(() => {
    window.location.href = HelpEmail;
  }, []);

  const subscribePlan = useCallback(
    async (planCode) => {
      setButtonLoading(true);
      fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/plans/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          planCode: planCode,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (planCode === "free") {
            if (json && json.statusCode === 200) {
              router.reload();
            }
          } else {
            if (json && json.payload) {
              setToastMessage("Successfully! You will be redirect in 5 seconds");
              window.location = json.payload.confirmationUrl;
            } else {
              setToastMessage("Failed! Please refresh and try again");
            }
          }
        })
        .catch((e) => {
          console.debug("[MSR] ERROR", e.toString());
          setToastMessage("Failed! Please refresh and try again");
        });
    },
    [jwt, router],
  );

  const cancelSubscription = async () => {
    setButtonLoading(true);
    try {
      let cancelSubscriptionReq = await fetch(
        `https://${process.env.NEXT_PUBLIC_SERVER_URL}/plans/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({
            reason: selectedReason == REASON_OPTIONS.DEFAULT ? "" : selectedReason,
            description: reasonDescription,
          }),
        },
      );

      let cancelSubscriptionRes = await cancelSubscriptionReq.json();

      if (cancelSubscriptionRes && cancelSubscriptionRes.message == "OK") {
        setToastMessage("Cancel subscription successfully!");
        setToastActive(true);
        setButtonLoading(false);
        router.push("/plans");
      }
    } catch (e) {
      console.log(e);
    }
    setButtonLoading(false);
  };

  const handleActiveUnsubModal = useCallback(() => {
    setActiveUnsubModal(!activeUnsubModal);
    setModalData("contact_support_modal");
    setSelectedReason(REASON_OPTIONS.DEFAULT);
    setReasonDescription("");
  }, [activeUnsubModal]);

  const buttonSubscription = useCallback(
    (plan) => {
      return (
        <>
          {appPlanCode === plan
            ? plan !== "free" && (
                <Button
                  onClick={() => setActiveUnsubModal(true)}
                  variant="primary"
                  tone="critical"
                  disabled={plan === "free"}
                  loading={buttonLoading}
                >
                  Unsubscribe
                </Button>
              )
            : plan !== "free" && (
                <Button
                  onClick={() => subscribePlan(plan)}
                  variant="primary"
                  tone="success"
                  loading={buttonLoading}
                >
                  Subscribe
                </Button>
              )}
        </>
      );
    },
    [appPlanCode, buttonLoading],
  );
  const contactSupModal = (
    <>
      <Modal.Section>
        <Box padding={0}>
          <BlockStack gap={200}>
            <Text variant="bodyMd" as="p">
              We&apos;re sorry to hear that you&apos;re considering unsubscribing.
            </Text>
            <Text variant="bodyMd" as="p">
              Please notice that when you downgrade to Free plan, only{" "}
              <strong>last 400 active customers</strong> can continue to be recorded until quota
              reset. The current customer information will not be deleted. In addition, the{" "}
              <strong>Heatmaps</strong> feature will be no longer available.<br></br>
            </Text>
            <Text variant="bodyMd" as="p">
              We&apos;re always here to help you with any issues you may encounter, including{" "}
              <strong>theme integration</strong> or <strong>how to use the app.</strong>
            </Text>
          </BlockStack>
        </Box>
      </Modal.Section>
      <Box padding={300}>
        <InlineStack align="end">
          <ButtonGroup>
            <Button
              onClick={() => {
                setModalData("feedback_modal");
              }}
            >
              Unsubscribe
            </Button>
            <Button variant="primary" onClick={handleEmailRedirect}>
              Contact support
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Box>
    </>
  );
  const feedBackModal = (
    <>
      <Box padding={"400"}>
        <FormLayout>
          <Select
            label={`Reason you're leaving`}
            options={ReasonOptions}
            onChange={handleSelectChange}
            value={selectedReason}
          />
          {selectedReason !== REASON_OPTIONS.DEFAULT && (
            <TextField
              label={REASON_DATA[selectedReason].title}
              value={reasonDescription}
              onChange={handleChangeReasonDescription}
              multiline={5}
              autoComplete="off"
              helpText={REASON_DATA[selectedReason].helpText}
            />
          )}
        </FormLayout>
      </Box>
      <Divider borderColor="border" />
      <Box padding={300}>
        <InlineStack align="end">
          <ButtonGroup>
            <Button
              onClick={() => {
                handleActiveUnsubModal();
              }}
            >
              Go back to app
            </Button>
            <Button onClick={() => setModalData("unsubscribe_modal")} variant="primary">
              Continue to unsubscribe
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Box>
    </>
  );

  const unsubscribeModal = (
    <>
      <Box padding={"400"}>
        <Text variant="bodyMd" as="p">
          Comeback anytime, all the rules that you have set up will still be available.
        </Text>
      </Box>
      <Divider borderColor="border" />
      <Box padding={300}>
        <InlineStack align="end">
          <ButtonGroup>
            <Button
              onClick={() => {
                handleActiveUnsubModal();
              }}
            >
              Go back to app
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                cancelSubscription();
              }}
              loading={buttonLoading}
            >
              Unsubscribe
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Box>
    </>
  );

  useEffect(() => {
    setFetching(false);
  }, []);

  return (
    <Page>
      {fetching ? (
        <FetchingPage />
      ) : (
        <div className="bss-ltap-container">
          <Modal
            open={activeUnsubModal}
            onClose={handleActiveUnsubModal}
            titleHidden={!modalSetting.title}
            title={
              <Text variant="bodyMd" fontWeight="semibold">
                {modalSetting.title}
              </Text>
            }
            primaryAction={modalSetting.primaryAction}
            secondaryActions={modalSetting.secondaryActions}
          >
            {getModalData()}
          </Modal>
          <div className="banner-container"></div>
          <Scrollable style={{ height: "100%" }}>
            <Layout.Section>
              <div className="pricing-title-header">
                <h1>FREE Trials for 14 days.</h1>
                <h2>FREE FOREVER for trial stores & development stores.</h2>
                <h2>CANCEL ANY TIME. FEEL FREE TO CONTACT US IF YOU HAVE PROBLEMS.</h2>
              </div>
              <div className="comparison">
                <table>
                  <thead>
                    <PlanHeader
                      appPlanCode={appPlanCode}
                      sub_bfcm={sub_bfcm}
                      applyBfcm={applyBfcm}
                    />
                  </thead>
                  <tbody className="pricing-main-section">
                    <tr>
                      <td />
                      <td colSpan={3}>Visitors Limit</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Visitors Limit (/month)</td>
                      <td>
                        <span className="tickblue">400</span>
                      </td>
                      <td>
                        <span className="tickblue">2000</span>
                      </td>
                      <td>
                        <span className="tickblue">10000</span>
                      </td>
                    </tr>
                    <tr>
                      <td />
                      <td colSpan={3}>Delete visitors</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Delete visitors</td>
                      <td>
                        <span className="tickblue">1 time =&gt; Max 800 visitors</span>
                      </td>
                      <td>
                        <span className="tickblue">3 times =&gt; Max 8000 visitors</span>
                      </td>
                      <td>
                        <span className="tickblue">Unlimited times =&gt; Unlimited visitors</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Exclude by IPs, countries</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Exclude by IPs, countries</td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Heatmaps</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Heatmaps</td>
                      <td></td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Customer Surveys</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Customer Surveys</td>
                      <td></td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Advanced filters</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Advanced filters</td>
                      <td></td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                      <td>
                        <span className="tickblue">✔</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Live view</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Live View</td>
                      <td></td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Live Chat with visitors</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Live Chat with visitors</td>
                      <td />
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Announcement Banner</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Announcement Banner</td>
                      <td></td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Session Targeting</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Session Targeting</td>
                      <td></td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>Exclude by sourceid</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">Exclude by sourceid</td>
                      <td />
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan={3}>A/B Testing</td>
                    </tr>
                    <tr className="compare-row">
                      <td className="compare-title">A/B Testing</td>
                      <td />
                      <td />
                      <td>
                        <span className="tickblue">Coming soon</span>
                      </td>
                    </tr>
                  </tbody>
                  <thead>
                    <tr className="pricing-plan__footer">
                      <th />
                      <th>
                        <div className="bss-ltap-button-subscription action-button">
                          {buttonSubscription("free")}
                        </div>
                      </th>
                      <th>
                        <div className="bss-ltap-button-subscription action-button">
                          {buttonSubscription("basic")}
                        </div>
                      </th>
                      <th>
                        <div className="bss-ltap-button-subscription action-button">
                          {buttonSubscription("advanced")}
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </Layout.Section>
          </Scrollable>
        </div>
      )}
      {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
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
