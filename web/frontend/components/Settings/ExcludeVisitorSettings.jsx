import {
  BlockStack,
  Button,
  Card,
  Divider,
  FormLayout,
  Icon,
  InlineStack,
  Layout,
  LegacyFilters,
  Modal,
  ResourceItem,
  ResourceList,
  Tag,
  Text,
  TextField,
} from "@shopify/polaris";
import { CancelSmallMinor, SearchMinor } from "@shopify/polaris-icons";
import ImageComponent from "components/ImageComponent";
import { COUNTRIES } from "helpers/country.helper";
import { getCountryImage } from "helpers/image.helper";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addExcludedIp,
  removeExcludedIp,
  selectExcludeVisitorSettings,
  setExcludedCountry,
} from "redux/reducers/settings.reducer";
import { v4 as uuidv4 } from "uuid";

import { isValidCIDR, isValidIP } from "helpers/checker.helper";
import Banner from "./BannerStyle.module.css";
const MAX_COUNTRY_BANNER = 5; //MAX countries display in banner
const MAX_COUNTRY_MODAL = 8; // MAX countries display in modal

export default function ExcludeVisitorSettings() {
  const dispatch = useDispatch();
  const { ips: excludedIps, countries: excludedCountries } = useSelector(
    selectExcludeVisitorSettings,
  );
  const listSampleCountry = Object.keys(COUNTRIES);
  const [listModalCountry, setListModalCountry] = useState(listSampleCountry);

  const [excludedIp, setExcludeIp] = useState("");
  const [excludedIpErr, setExcludedIpErr] = useState(null);

  const [selectedCountryList, setSelectedCountryList] = useState(excludedCountries); // List selected countries
  const preSelectedCountryList = useRef(excludedCountries);

  const [countryText, setCountryText] = useState("");
  const [active, setActive] = useState(false);
  const [queryValue, setQueryValue] = useState("");
  const [filters, setFilters] = useState([]);
  const [numberDisplay, setNumberDisplay] = useState(MAX_COUNTRY_BANNER);
  const [numberDisplayModal, setNumberDisplayModal] = useState(MAX_COUNTRY_MODAL);
  const [showMore, setShowMore] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);

  const handleCountryTextChange = useCallback((value) => {
    setCountryText(value);
  }, []);

  const handleFiltersQueryChange = useCallback((value) => {
    setQueryValue(value);
    setLoadingModal(true);
  }, []);

  useEffect(() => {
    const updateCountry = () => {
      setNumberDisplayModal(MAX_COUNTRY_MODAL);
      let listNewCountry = listSampleCountry.filter((country) => {
        return COUNTRIES[country].toLowerCase().includes(queryValue.toLowerCase());
      });
      setListModalCountry(listNewCountry);
      if (listNewCountry.length > MAX_COUNTRY_MODAL) setShowMoreModal(true);
      else setShowMoreModal(false);
      setLoadingModal(false);
    };
    setShowMoreModal(false);
    const delayFetch = setTimeout(() => {
      updateCountry();
    }, 1000);
    return () => clearTimeout(delayFetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryValue]);

  const handleQueryValueRemove = useCallback(() => {
    setQueryValue("");
  }, []);

  const handleSelectChange = useCallback(
    (value) => {
      if (value.length > 0 && !isNaN(value[0])) {
        setSelectedCountryList(listModalCountry.slice(0, value.length));
      } else if (value.length === 0) {
        setSelectedCountryList([]);
      } else if (value.length === listSampleCountry.length) {
        setSelectedCountryList(listSampleCountry);
      } else {
        setSelectedCountryList(value);
      }
    },
    [listModalCountry, listSampleCountry],
  );

  function renderResourceItem(item) {
    const media = <ImageComponent loader={getCountryImage} src={item} width={45} />;
    return (
      <ResourceItem id={item} media={media} key={uuidv4()}>
        <h3>
          <Text as="h1" fontWeight="semibold">
            {COUNTRIES[item]}
          </Text>
        </h3>
      </ResourceItem>
    );
  }

  const onRemoveBanner = (id) => {
    let newListIdCountry = selectedCountryList.filter((countryId) => {
      return countryId !== id;
    });
    setSelectedCountryList(newListIdCountry);
    dispatch(setExcludedCountry(newListIdCountry));
    preSelectedCountryList.current = newListIdCountry;
  };

  const handleChangeExcludedIp = useCallback((value) => {
    setExcludedIpErr("");
    setExcludeIp(value.trim());
  }, []);

  const handleAddExcludedIp = useCallback(() => {
    if (excludedIp.length === 0) {
      setExcludedIpErr("IP or CIDR cannot be empty");
    } else {
      if (isValidIP(excludedIp) || isValidCIDR(excludedIp)) {
        if (excludedIps.indexOf(excludedIp) === -1) {
          dispatch(addExcludedIp(excludedIp));
          setExcludeIp("");
        } else {
          setExcludedIpErr("IP exists");
        }
      } else {
        setExcludedIpErr("IP or CIDR is invalid");
      }
    }
  }, [dispatch, excludedIp, excludedIps]);

  const handleRemoveExcludedIp = useCallback(
    (ip) => {
      dispatch(removeExcludedIp(ip));
    },
    [dispatch],
  );

  const handleCloseModel = useCallback(() => {
    setActive(false);
    setSelectedCountryList(preSelectedCountryList.current);
  }, []);

  const handleAddModel = useCallback(() => {
    setActive(false);
    preSelectedCountryList.current = selectedCountryList;
    setNumberDisplay(MAX_COUNTRY_BANNER);
    dispatch(setExcludedCountry(selectedCountryList));
  }, [selectedCountryList, dispatch]);

  const handleShowMoreModalClick = useCallback(() => {
    setNumberDisplayModal(numberDisplayModal + MAX_COUNTRY_MODAL);
    if (listModalCountry.length < numberDisplayModal + MAX_COUNTRY_MODAL) setShowMoreModal(false);
  }, [numberDisplayModal, listModalCountry]);

  useEffect(() => {
    if (selectedCountryList.length > numberDisplay) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  }, [selectedCountryList, numberDisplay]);

  useEffect(() => {
    if (JSON.stringify(preSelectedCountryList.current) !== JSON.stringify(excludedCountries)) {
      //Discard
      setSelectedCountryList(excludedCountries);
      setNumberDisplay(MAX_COUNTRY_BANNER);
    }
  }, [excludedCountries]);

  const description = (
    <span>
      Exclude IPs, CIDR Ranges or Countries <br />
      We support IPv4 format only: <br />
      0.0.0.0 (IP address) <br />
      0.0.0.0/24 (CIDR range)
    </span>
  );

  return (
    <Layout.AnnotatedSection title="Exclude visitors" description={description}>
      <Card>
        <BlockStack gap="500">
          <Text as="h1" variant="headingSm">
            Exclude by IPS
          </Text>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                label="Excluded IPs"
                labelHidden={true}
                placeholder={"0.0.0.0"}
                value={excludedIp}
                onChange={handleChangeExcludedIp}
                error={excludedIpErr}
              />
              <Button size="large" onClick={handleAddExcludedIp}>
                Add
              </Button>
            </FormLayout.Group>
            {excludedIps.length > 0 && (
              <InlineStack spacing="tight">
                {excludedIps.map((ip) => (
                  <Tag key={ip} onRemove={() => handleRemoveExcludedIp(ip)}>
                    {ip}
                  </Tag>
                ))}
              </InlineStack>
            )}
          </FormLayout>
          <Divider />
          <Text as="h1" variant="headingSm">
            Exclude by Countries
          </Text>
          <FormLayout>
            <FormLayout.Group>
              <TextField
                type="text"
                value={countryText}
                onChange={handleCountryTextChange}
                prefix={<Icon source={SearchMinor} tone="base" />}
                autoComplete="off"
                onFocus={() => setActive(true)}
              />
            </FormLayout.Group>
          </FormLayout>
          <Modal
            open={active}
            onClose={handleCloseModel}
            title="Select country"
            primaryAction={{
              content: "Add",
              onAction: handleAddModel,
            }}
            secondaryActions={[
              {
                content: "Cancel",
                onAction: handleCloseModel,
              },
            ]}
          >
            <Modal.Section>
              <ResourceList
                resourceName={{ singular: "country", plural: "countries" }}
                items={listModalCountry.slice(0, numberDisplayModal)}
                renderItem={renderResourceItem}
                selectedItems={selectedCountryList}
                onSelectionChange={handleSelectChange}
                filterControl={
                  <LegacyFilters
                    queryValue={queryValue}
                    filters={filters}
                    onQueryChange={handleFiltersQueryChange}
                    onQueryClear={handleQueryValueRemove}
                  />
                }
                selectable
                loading={loadingModal}
              />
              {showMoreModal && (
                <Button fullWidth variant="plain" onClick={handleShowMoreModalClick}>
                  Show more
                </Button>
              )}
            </Modal.Section>
          </Modal>
          <div style={{ maxHeight: "380px", overflowX: "hidden", overflowY: "auto" }}>
            {excludedCountries &&
              excludedCountries.map((country) => {
                return (
                  <div className={Banner.container} key={uuidv4()}>
                    <ImageComponent
                      loader={getCountryImage}
                      src={country}
                      width={45}
                      loading={"eager"}
                      priority={true}
                    />
                    <div className={Banner.info}>{COUNTRIES[country]}</div>
                    <span style={{ color: "#bf0711", paddingTop: "3px" }}>
                      <Button
                        variant="plain"
                        icon={<Icon source={CancelSmallMinor} />}
                        onClick={() => onRemoveBanner(country)}
                      ></Button>
                    </span>
                  </div>
                );
              })}
          </div>
        </BlockStack>
      </Card>
    </Layout.AnnotatedSection>
  );
}
