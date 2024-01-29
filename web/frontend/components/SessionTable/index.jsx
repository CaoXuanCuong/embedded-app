import {
  Button,
  ButtonGroup,
  EmptySearchResult,
  Icon,
  IndexTable,
  Modal,
  Spinner,
  Text,
  TextContainer,
  Toast,
  Tooltip,
  useIndexResourceState,
  Card,
  InlineStack,
} from "@shopify/polaris";
import { AlertMinor, DeleteMinor, PlayMinor, ReplayMinor } from "@shopify/polaris-icons";
import DeleteModal from "components/DeleteModal";
import { CursorPagination } from "components/Pagination";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectShop } from "redux/reducers/general.reducer";
import {
  setSelected,
  filterReducer as reducer,
  setSelectedList,
  selectFitlerMode,
} from "redux/reducers/sessions.reducer";
import { deleteSession } from "services/session.service";
import { dateTimeFormat } from "../../helpers/time.helper";
import useSWR from "swr";
import { fetchData } from "services/swr.service";
import Filter from "./Filter";
import { getCountryName } from "helpers/country.helper";
import PageHistory from "./PageHistory";
import styles from "./SessionTable.module.css";
import useDebounce from "hooks/useDebounce";
import { InstallMinor } from "@shopify/polaris-icons";

const { NEXT_PUBLIC_SERVER_URL } = process.env;

export default function SessionTable({ jwt, visitor }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { myshopifyDomain, appPlanCode } = useSelector(selectShop);
  const filterMode = useSelector(selectFitlerMode);
  const [filter, dispatchReduce] = useReducer(reducer, {
    event: [],
    visited_page: [],
    exit_page: [],
    duration: [],
    device: [],
    browser: [],
    operating_system: [],
    location: [],
    page_per_session: [],
  });

  const resourceName = {
    singular: "session",
    plural: "sessions",
  };

  const isVisitorTable = useMemo(() => {
    return router.pathname === "/visitors/[id]";
  }, [router]);

  const headings = useMemo(() => {
    if (isVisitorTable) {
      return [
        { title: "Date/Time" },
        { title: "Pages" },
        { title: "Duration" },
        { title: "Actions" },
      ];
    } else {
      return [
        { title: "Visitor ID" },
        { title: "Date/Time" },
        { title: "Pages" },
        { title: "Duration" },
        { title: "Location" },
        { title: "Actions" },
      ];
    }
  }, [isVisitorTable]);

  const emptyStateMarkup = (
    <EmptySearchResult
      title={`No ${resourceName.plural} yet`}
      description={"Try changing the filters or search term"}
      withIllustration
    />
  );

  const [currentPage, setCurrentPage] = useState(localStorage.getItem("currentPage") || 1);
  const [totalPage, setTotalPage] = useState(1);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [modalActive, setModalActive] = useState(false);
  const handleChangeModalActive = useCallback(() => setModalActive(!modalActive), [modalActive]);
  const [toastMessage, setToastMessage] = useState(localStorage.getItem("toastMessage") || "");
  const [toastActive, setToastActive] = useState(
    localStorage.getItem("toastHandle") === "true" || false,
  );
  const resourceIDResolver = (session) => {
    return session._id;
  };
  const [sidebarActive, setSidebarActive] = useState(false);
  const [rowActive, setRowActive] = useState("");
  const [url, setUrl] = useState("");
  const queryDebounceUrl = useDebounce(url, 500);
  const [sessionsPerPage, setSessionsPerPage] = useState(sessionStorage.getItem("sessionsPerPage"));

  const { data, isLoading, isValidating, mutate } = useSWR([queryDebounceUrl, jwt], fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
    clearSelection,
    removeSelectedResources,
  } = useIndexResourceState(sessions, { resourceIDResolver });
  const downloadUrl = useMemo(() => {
    const tzOffset = new Date().getTimezoneOffset() / 60;
    const searchParams = new URLSearchParams();
    searchParams.set("token", jwt);
    if (selectedResources && selectedResources.length) {
      searchParams.set("type", "ids");
      searchParams.set("ids", selectedResources.join(","));
    } else {
      searchParams.set("type", "all");
    }
    if (visitor) {
      searchParams.set("visitor", visitor);
    } else {
      searchParams.set("visitor", "all");
    }
    searchParams.set("tz", tzOffset);
    return `https://${NEXT_PUBLIC_SERVER_URL}/export/recordings?${searchParams.toString()}`;
  }, [visitor, jwt, selectedResources]);
  const bulkActions = [
    {
      content: "Delete sessions",
      onAction: () => handleChangeModalActive(),
    },
    {
      content: "Download CSV",
      onAction: () => {
        window.open(downloadUrl, "_blank");
      },
    },
  ];
  const handleToggleToast = useCallback(() => {
    setToastActive((prev) => !prev);
  }, []);

  const handlePlay = useCallback(
    (sessionId) => {
      router.push(`/replays/${sessionId}${visitor ? `?visitor=${visitor}` : ""}`);
    },
    [router, visitor],
  );

  const handleToggleDeleteModal = useCallback(() => {
    if (!deleteLoading) setDeleteModalActive((prev) => !prev);
  }, [deleteLoading]);

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    if (
      currentPage > 1 &&
      (selectedResources.length == sessions.length ||
        (deleteId && deleteId.length == sessions.length))
    ) {
      localStorage.setItem("currentPage", currentPage - 1);
    }
    const result = await deleteSession(modalActive ? selectedResources : deleteId, jwt);
    if (result.ok) {
      clearSelection();
      localStorage.setItem("toastMessage", result.message);
      localStorage.setItem("toastHandle", true);
    }
    setToastMessage(result.message);
    handleToggleToast();
    setDeleteLoading(false);
    if (!modalActive) {
      handleToggleDeleteModal();
    } else {
      setModalActive(false);
    }
    // refetch data
    mutate();
  }, [
    jwt,
    deleteId,
    handleToggleDeleteModal,
    handleToggleToast,
    modalActive,
    clearSelection,
    selectedResources,
  ]);

  useEffect(() => {
    dispatch(setSelectedList([...selectedResources]));
  }, [selectedResources]);

  useEffect(() => {
    // Update selected session when change filter
    if (sessions.length && selectedResources.length) {
      let sessionIds = sessions.map((obj) => obj._id);
      let needRemoveIds = selectedResources.filter((val) => !sessionIds.includes(val));
      removeSelectedResources(needRemoveIds);
    }
  }, [sessions]);

  useEffect(() => {
    let query = `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions?page=${currentPage}`;
    if (visitor) {
      query += `&visitor=${visitor}`;
    }
    let sessionsPerPage =
      router.pathname === "/replays" ? sessionStorage.getItem("sessionsPerPage") : 10;
    query += `&limit=${sessionsPerPage}`;
    Object.keys(filter).map((key) => {
      if (filter[key] && filter[key].length) {
        if (key === "exit_page" || key === "visited_page") {
          let str = filter[key].toString();
          query += `&${key}=${btoa(str)}`;
        } else {
          query += `&${key}=${filter[key]}`;
        }
      }
    });
    setUrl(query);
  }, [jwt, visitor, currentPage, sessionsPerPage, filter]);

  useEffect(() => {
    if (data && (data.statusCode === 200 || data.statusCode === 404)) {
      setSessions(data.payload);
      setTotalPage(data.total);
      setCurrentPage(data.current);
      localStorage.setItem("currentPage", data.current);
    }
  }, [jwt, data]);

  const handlePagesClick = useCallback(
    (item, e) => {
      e.stopPropagation();
      setSidebarActive(() => {
        if (item._id === rowActive) {
          setRowActive("");
          return false;
        } else {
          setRowActive(item._id);
          return true;
        }
      });
      dispatch(setSelected(item));
    },
    [dispatch, rowActive],
  );

  useEffect(() => {
    localStorage.setItem("toastMessage", toastMessage);
    localStorage.setItem("toastHandle", toastActive);
  }, [toastMessage, toastActive]);

  return (
    <>
      <Card>
        {!visitor && (
          <div className="mida-session-filter">
            <InlineStack wrap={false}>
              <Filter
                jwt={jwt}
                filter={filter}
                dispatch={dispatchReduce}
                setToastActive={setToastActive}
                setToastMessage={setToastMessage}
                currentPlan={appPlanCode}
                tableLoading={isLoading || isValidating}
              />
              <div
                style={{
                  aspectRatio: "1 / 1",
                  borderBottom: "var(--p-border-width-025) solid var(--p-color-border)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Tooltip active={true} content="Download">
                  <Button
                    icon={<Icon source={InstallMinor} tone="base" />}
                    download={true}
                    url={downloadUrl}
                    target="_blank"
                    disabled={filterMode !== "DEFAULT"}
                  />
                </Tooltip>
              </div>
            </InlineStack>
          </div>
        )}
        <div className="mida-session-table">
          <IndexTable
            resourceName={resourceName}
            itemCount={sessions.length}
            headings={headings}
            loading={isLoading || isValidating}
            emptyState={emptyStateMarkup}
            selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            selectable={true}
            bulkActions={bulkActions}
            lastColumnSticky
          >
            {isLoading || isValidating ? (
              <IndexTable.Cell className={styles.spinner_container}>
                <Spinner accessibilityLabel="Spinner session table" size="small" />
              </IndexTable.Cell>
            ) : null}
            {!isLoading &&
              !isValidating &&
              sessions.map((item, index) => {
                const {
                  _id,
                  createdAt,
                  viewed,
                  location,
                  customer_id,
                  duration,
                  visitor,
                  countPageview,
                } = item;
                const date = new Date(createdAt);
                const country = getCountryName(location);
                return (
                  <IndexTable.Row
                    id={_id}
                    key={_id}
                    position={index}
                    selected={selectedResources.includes(_id)}
                    status={rowActive === _id ? "subdued" : ""}
                  >
                    {!isVisitorTable && (
                      <IndexTable.Cell>
                        {customer_id && customer_id !== "null" ? (
                          <Link
                            href={`https://${myshopifyDomain}/admin/customers/${customer_id}`}
                            passHref={true}
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {customer_id}
                            </a>
                          </Link>
                        ) : (
                          visitor
                        )}
                      </IndexTable.Cell>
                    )}
                    <IndexTable.Cell>{`${dateTimeFormat(date)}`}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <div className="mida-count-pages" onClick={(e) => handlePagesClick(item, e)}>
                        {countPageview}
                      </div>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{`${
                      Math.floor(Math.round(duration) / 60) < 10
                        ? "0" + Math.floor(Math.round(duration) / 60)
                        : Math.floor(Math.round(duration) / 60)
                    } : ${
                      Math.floor(Math.round(duration) % 60) < 10
                        ? "0" + Math.floor(Math.round(duration) % 60)
                        : Math.floor(Math.round(duration) % 60)
                    }`}</IndexTable.Cell>
                    {!isVisitorTable && (
                      <IndexTable.Cell>
                        <div className="mida-visitors location">{country}</div>
                      </IndexTable.Cell>
                    )}
                    <IndexTable.Cell>
                      <ButtonGroup>
                        {!item.checkTheme && (
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
                        {item.checkTheme && (
                          <div className="mida-alert-minor-icon">
                            <Icon source={AlertMinor} tone="warning" />
                          </div>
                        )}
                        <div className="mida-acition-play">
                          <Button
                            size="large"
                            icon={
                              item.checkTheme ? (
                                <Icon source={viewed ? ReplayMinor : PlayMinor} tone="success" />
                              ) : (
                                <Icon source={viewed ? ReplayMinor : PlayMinor} tone="subdued" />
                              )
                            }
                            onClick={() => handlePlay(_id)}
                            disabled={!item.checkTheme}
                          >
                            {viewed ? "Replay" : "Play"}
                          </Button>
                        </div>
                        <Button
                          size="large"
                          icon={<Icon source={DeleteMinor} tone="critical" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId([_id]);
                            handleToggleDeleteModal();
                          }}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                );
              })}
          </IndexTable>
          <DeleteModal
            resource={"session"}
            resourceId={deleteId}
            active={deleteModalActive}
            onClose={handleToggleDeleteModal}
            loading={deleteLoading}
            onAction={handleDelete}
          />
          {toastActive ? <Toast content={toastMessage} onDismiss={handleToggleToast} /> : null}
        </div>
      </Card>
      <br />
      <Modal
        open={modalActive}
        onClose={handleChangeModalActive}
        title={
          selectedResources.length && selectedResources.length === 1
            ? "Delete session"
            : "Delete sessions"
        }
        primaryAction={{
          destructive: true,
          content: "Delete",
          onAction: () => {
            handleDelete();
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => handleChangeModalActive(),
          },
        ]}
        loading={deleteLoading}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              Are you sure to delete{" "}
              {selectedResources.length && selectedResources.length === 1 ? (
                <span>
                  session <strong>{"#" + selectedResources[0]}</strong>?
                </span>
              ) : (
                `all sessions selected?`
              )}{" "}
            </p>
          </TextContainer>
        </Modal.Section>
      </Modal>
      <CursorPagination
        loading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        total={totalPage}
        setSessionsPerPage={setSessionsPerPage}
      />
      <br />
      <PageHistory
        jwt={jwt}
        active={sidebarActive}
        setActive={setSidebarActive}
        setRowActive={setRowActive}
      />
    </>
  );
}
