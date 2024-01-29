import {
  Button,
  ButtonGroup,
  Card,
  Icon,
  IndexTable,
  Text,
  Tooltip,
  useIndexResourceState,
} from "@shopify/polaris";
import { AlertMinor, PlayMinor, ReplayMinor } from "@shopify/polaris-icons";
import { CursorPagination } from "components/Pagination";
import {
  getBrowserImage,
  getCountryImage,
  getDeviceTypeImage,
  getOSImage,
} from "helpers/image.helper";
import { convertDurationToMmSs, dateTimeFormat } from "helpers/time.helper";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";
import SearchAutoComplete from "../SearchAutoComplete";
import LocalStorageConst from "consts/LocalStorage.const";
import { getCountryName } from "helpers/country.helper";
import styles from "./component.module.css";
import useSWR from "swr";
import { fetchData } from "services/swr.service";

const headings = [
  { title: "Session ID" },
  { title: "Email" },
  { title: "Date" },
  { title: "Duration" },
  { title: "Device" },
  { title: "Location" },
  { title: "Actions" },
];

const resourceName = {
  singular: "pageview",
  plural: "pageviews",
};

export default function PageViewTable({ jwt, hrefs, searchquery }) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(localStorage.getItem("currentPage") || 1);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState(function () {
    const urlStorage = JSON.parse(localStorage.getItem(LocalStorageConst.PAGE_VIEW)) || "";
    if (searchquery && searchquery.search && searchquery.search != "") {
      return searchquery.search;
    } else if (urlStorage) {
      return urlStorage;
    } else {
      return "";
    }
  });
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(pages);

  const handlePlay = useCallback(
    (pageviewId) => {
      router.push(`/pageviews/${pageviewId}`);
    },
    [router],
  );

  const handleSessionClick = useCallback(
    (sessionId) => {
      router.push(`/replays/${sessionId}`);
    },
    [router],
  );

  const handleSearch = useCallback(() => {
    if (search && search.length > 0) {
      localStorage.setItem(LocalStorageConst.PAGE_VIEW, JSON.stringify(search));
    }
  }, [search]);

  const { data, isLoading } = useSWR(
    [
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews?href=${search}&page=${currentPage}`,
      jwt,
    ],
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (data && (data.statusCode === 200 || data.statusCode === 404)) {
      setPages(data.payload.pageViews);
      setTotalPage(data.total);
      setCurrentPage(data.current);
    }
  }, [jwt, data]);
  let isShow = search && search.length && pages && pages.length > 0;
  return (
    <>
      <SearchAutoComplete
        hrefs={hrefs}
        setSearch={setSearch}
        onSearch={handleSearch}
        searchquery={searchquery}
      />
      <br />
      <Card>
        <div className="mida-session-table">
          <IndexTable
            resourceName={resourceName}
            itemCount={1}
            headings={headings}
            loading={loading}
            selectable={false}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          >
            {!loading &&
              isShow &&
              pages.map((page, index) => {
                const { _id, createdAt, session, duration, viewed } = page;

                if (session) {
                  const {
                    _id: _idSession,
                    os,
                    browser,
                    device,
                    location,
                    customer_id,
                    customer_email,
                    checkTheme,
                  } = session;
                  const date = new Date(createdAt);
                  const country = getCountryName(location);

                  return (
                    <IndexTable.Row
                      id={_id}
                      key={_id}
                      position={index}
                      selected={selectedResources.includes(_id)}
                      status={viewed ? "subdued" : ""}
                    >
                      <IndexTable.Cell id={_id} key={_id}>
                        <span
                          onClick={() => handleSessionClick(_idSession)}
                          style={{ cursor: "pointer", color: "#2c6ecb" }}
                        >
                          {_idSession}
                        </span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {customer_id && customer_id !== "null"
                          ? customer_email
                            ? customer_email
                            : "Not retrieved yet"
                          : "Guest"}
                      </IndexTable.Cell>
                      <IndexTable.Cell>{`${dateTimeFormat(date)}`}</IndexTable.Cell>
                      <IndexTable.Cell>{convertDurationToMmSs(duration)}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <div className="mida-visitors device">
                          <div>
                            <Image
                              loader={getOSImage}
                              src={os}
                              width={20}
                              height={20}
                              alt={os}
                              title={os}
                            />
                          </div>
                          <div>
                            <Image
                              loader={getBrowserImage}
                              src={browser}
                              width={20}
                              height={20}
                              alt={browser}
                              title={browser}
                            />
                          </div>
                          <div className="icon">
                            <Icon source={getDeviceTypeImage(device)} tone="base" />
                          </div>
                        </div>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <div className="mida-visitors location">
                          <Image
                            loader={getCountryImage}
                            src={location}
                            width={30}
                            height={20}
                            alt={location}
                            title={location}
                          />
                          <div>&nbsp;&nbsp;{country}</div>
                        </div>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <ButtonGroup>
                          {!checkTheme && (
                            <Tooltip
                              content={
                                <Text as="span" variant="bodyMd" tone="subdued">
                                  The recording is not available because the corresponding theme has
                                  been removed.
                                </Text>
                              }
                            >
                              <Icon source={AlertMinor} tone="warning" />
                            </Tooltip>
                          )}
                          {checkTheme && (
                            <div className="mida-alert-minor-icon">
                              <Icon source={AlertMinor} tone="warning" />
                            </div>
                          )}
                          <Button
                            disabled={!checkTheme}
                            icon={
                              <Icon
                                source={viewed ? ReplayMinor : PlayMinor}
                                tone={checkTheme ? "success" : "subdued"}
                              />
                            }
                            onClick={() => handlePlay(_id)}
                          >
                            {viewed ? "Replay" : "Play"}
                          </Button>
                        </ButtonGroup>
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  );
                } else {
                  return null;
                }
              })}
          </IndexTable>
          {!isShow && (
            <div className={styles.empty_table}>
              <h1>
                <strong>No page views available</strong>
              </h1>
              <p>Please choose a page to view have your data shown here</p>
            </div>
          )}
        </div>
      </Card>
      <br />
      {isShow && (
        <CursorPagination
          loading={isLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          total={totalPage}
        />
      )}
    </>
  );
}
