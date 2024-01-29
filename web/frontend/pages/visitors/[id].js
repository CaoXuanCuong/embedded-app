import("isomorphic-fetch");
import {
  BlockStack,
  Button,
  Card,
  Grid,
  Icon,
  InlineGrid,
  Layout,
  LegacyCard,
  Page,
  Spinner,
  Text,
  Tooltip,
} from "@shopify/polaris";
import SessionTable from "components/SessionTable";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { END } from "redux-saga";
import { SAGA_GET_SHOP_DATA_ASYNC } from "redux/actions/general.action";
import { wrapper } from "redux/store";
import { getCountryName } from "helpers/country.helper";
import { InstallMinor } from "@shopify/polaris-icons";
import { useSelector } from "react-redux";
import { selectSessionSelectedList } from "redux/reducers/sessions.reducer";

const { NEXT_PUBLIC_SERVER_URL } = process.env;

export default function RePlayer({ id, jwt }) {
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [visitorID, setVisitorID] = useState("");
  const [visitorUpdatedAt, setVisitorUpdatedAt] = useState("");
  const [visitorLocation, setVisitorLocation] = useState("");
  const [visitorAddress, setVisitorAddress] = useState({});
  const [visitorOS, setVisitorOS] = useState("");
  const [visitorBrowser, setVisitorBrowser] = useState("");
  const [visitorDeviceType, setVisitorDeviceType] = useState("");
  const sessionSelected = useSelector(selectSessionSelectedList);

  const fetchData = useCallback(async () => {
    const visitorRes = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/visitors/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });
    const visitorJson = await visitorRes.json();
    if (visitorJson && visitorJson.statusCode === 200) {
      const updatedAt = visitorJson.payload.lastActive
        ? new Date(visitorJson.payload.lastActive)
        : new Date(visitorJson.payload.updatedAt);
      setVisitorUpdatedAt(`${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`);
      setVisitorID(visitorJson.payload._id);
      setVisitorLocation(visitorJson.payload.location);
      setVisitorAddress(visitorJson.payload.address);
      setVisitorBrowser(visitorJson.payload.browser);
      setVisitorOS(visitorJson.payload.os);
      setVisitorDeviceType(visitorJson.payload.device);
    }
    setFetching(false);
  }, [id, jwt]);

  const downloadUrl = useMemo(() => {
    const tzOffset = new Date().getTimezoneOffset() / 60;
    const searchParams = new URLSearchParams();
    searchParams.set("token", jwt);
    if (sessionSelected && sessionSelected.length) {
      searchParams.set("type", "ids");
      searchParams.set("ids", sessionSelected.join(","));
    } else {
      searchParams.set("type", "all");
    }
    searchParams.set("visitor", id);
    searchParams.set("tz", tzOffset);
    return `https://${NEXT_PUBLIC_SERVER_URL}/export/recordings?${searchParams.toString()}`;
  }, [id, jwt, sessionSelected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => router.push("/visitors"), [router]);

  const locationContent = visitorAddress?.city
    ? `${visitorAddress.city}${
        visitorAddress.state ? `/${visitorAddress.state}` : ""
      } - ${getCountryName(visitorLocation)}`
    : getCountryName(visitorLocation);

  return (
    <Page fullWidth backAction={{ content: "Visitors", onAction: handleBack }} title="Visitors">
      <Layout>
        {fetching ? (
          <div>
            <Spinner accessibilityLabel="Spinner loading page" size="small" />
          </div>
        ) : (
          <React.Fragment>
            <Layout.Section>
              <Grid gap={{ xl: "32px" }}>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}>
                  <Card>
                    <Text variant="bodyMd" as="p" fontWeight="bold">
                      Visitor ID: {id}
                    </Text>
                    <div className="mida-card">
                      <Text variant="bodyMd" as="p" fontWeight="bold">
                        Last active
                      </Text>
                      <Text variant="bodyMd" as="p">
                        <span>Date/Time:</span>
                        <span>{visitorUpdatedAt}</span>
                      </Text>
                      <Text variant="bodyMd" as="p">
                        <span>Location:</span>
                        <span>{locationContent}</span>
                      </Text>
                    </div>
                    <div className="mida-card">
                      <Text variant="bodyMd" as="p" fontWeight="bold">
                        Device information
                      </Text>
                      <Text variant="bodyMd" as="p">
                        <span>OS:</span>
                        <span>{visitorOS}</span>
                      </Text>
                      <Text variant="bodyMd" as="p">
                        <span>Browser:</span>
                        <span>{visitorBrowser}</span>
                      </Text>
                      <Text variant="bodyMd" as="p">
                        <span>Device:</span>
                        <span>{visitorDeviceType}</span>
                      </Text>
                    </div>
                  </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 9, xl: 9 }}>
                  <LegacyCard sectioned>
                    {visitorID ? (
                      <BlockStack gap={"100"}>
                        <InlineGrid columns={"1fr auto"}>
                          <Text variant="bodyMd" as="p" fontWeight="bold">
                            <div style={{ marginBottom: "12px" }}>Sessions</div>
                          </Text>
                          <Tooltip active={true} content="Download">
                            <Button
                              icon={<Icon source={InstallMinor} tone="base" />}
                              download={true}
                              url={downloadUrl}
                              target="_blank"
                            />
                          </Tooltip>
                        </InlineGrid>
                        <SessionTable jwt={jwt} visitor={visitorID} />
                      </BlockStack>
                    ) : (
                      <Text variant="bodyMd" as="p" fontWeight="bold">
                        Visitor has been deleted!
                      </Text>
                    )}
                  </LegacyCard>
                </Grid.Cell>
              </Grid>
            </Layout.Section>
          </React.Fragment>
        )}
      </Layout>
    </Page>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, res, query }) => {
      const jwt = req.cookies["midaJWT"];
      const id = query.id;

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
          id,
          jwt,
        },
      };
    },
);
