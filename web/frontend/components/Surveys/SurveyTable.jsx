import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  EmptySearchResult,
  Icon,
  IndexTable,
  Text,
  TextField,
  useIndexResourceState,
} from "@shopify/polaris";
import {
  AnalyticsMinor,
  DeleteMinor,
  EditMinor,
  ListMajor,
  SearchMinor,
  ThumbsUpMajor,
} from "@shopify/polaris-icons";
import DeleteModal from "components/DeleteModal";
import { CursorPagination } from "components/Pagination";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { bulkDelete, bulkEditStatus, deleteSurvey } from "services/survey.service";
import { fetchData } from "services/swr.service";
import useSWR from "swr";
import styles from "./Survey.module.css";

export default function SurveyTable({ jwt, onToggleToast, onToastMessage, appPlanCode }) {
  const [filter, setFilter] = useState({
    currentPage: localStorage.getItem("surveyCurrentPage") || 1,
    totalPage: 1,
    searchValue: "",
  });

  const [surveyLoading, setSurveyLoading] = useState({
    loading: true,
    deleteLoading: false,
    deleteModalActive: false,
  });

  const { data, isLoading, mutate } = useSWR(
    [
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys?page=${filter.currentPage}&value=${filter.searchValue}`,
      jwt,
    ],
    fetchData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const [deleteData, setDeleteData] = useState({
    id: null,
    name: "",
  });

  const [surveys, setSurveys] = useState([]);

  const resourceIDResolver = (surveys) => {
    return surveys._id;
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
    useIndexResourceState(surveys, { resourceIDResolver });

  const router = useRouter();

  const resourceName = {
    singular: "survey",
    plural: "surveys",
  };

  const emptyStateMarkup = (
    <EmptySearchResult
      title={"No surveys yet"}
      description={`Click Add Survey to create your first survey`}
      withIllustration
    />
  );

  const handleStatusSurveyAction = useCallback(
    async (status) => {
      const allSurveyIds = selectedResources;
      await bulkEditStatus(allSurveyIds, status, jwt);
      mutate();
    },
    [jwt, selectedResources],
  );

  const handleDeleteSurveyAction = useCallback(async () => {
    const allSurveyIds = selectedResources;
    await bulkDelete(allSurveyIds, jwt);
    mutate();
    clearSelection();
  }, [jwt, selectedResources]);

  const page = useRef({
    current: 1,
    total: 1,
  });

  useEffect(() => {
    if (data && (data.statusCode === 200 || data.statusCode === 404)) {
      setSurveys([...data.payload]);
      page.current.total = data.total;
      setFilter((prev) => ({
        ...prev,
        currentPage: data.current,
        totalPage: data.total,
      }));
      setSurveyLoading((prev) => ({ ...prev, loading: isLoading }));
      localStorage.setItem("surveyCurrentPage", data.current);
    }
  }, [jwt, data, surveyLoading.loading, isLoading]);

  const handleToggleDeleteModal = useCallback(() => {
    if (!surveyLoading.deleteLoading) {
      setSurveyLoading((prev) => ({
        ...prev,
        deleteModalActive: !prev.deleteModalActive,
      }));
    }
  }, [surveyLoading.deleteLoading]);

  const handleDelete = useCallback(async () => {
    try {
      setSurveyLoading((prev) => ({ ...prev, deleteLoading: true }));

      const result = await deleteSurvey(deleteData.id, jwt);

      onToastMessage(result.message);
      onToggleToast();
      setSurveyLoading((prev) => ({ ...prev, deleteLoading: false }));
      mutate();
      clearSelection();
      handleToggleDeleteModal();
    } catch (e) {
      onToastMessage("An error occurred while deleting the survey.");
      onToggleToast();
    }
  }, [jwt, deleteData.id, onToastMessage, handleToggleDeleteModal, onToggleToast, router]);

  const handleFilterChange = (filterUpdate) => {
    setFilter((prev) => ({ ...prev, ...filterUpdate }));
  };

  const bulkActions = [
    {
      content: "Enable Survey",
      onAction: () => handleStatusSurveyAction(true),
    },
    {
      content: "Disable Survey",
      onAction: () => handleStatusSurveyAction(false),
    },
    {
      content: "Delete Survey",
      onAction: () => handleDeleteSurveyAction(),
    },
  ];

  return (
    <>
      <div className={styles.search}>
        <TextField
          value={filter.searchValue}
          onChange={(searchValue) => handleFilterChange({ searchValue: searchValue })}
          autoComplete="off"
          prefix={<Icon source={SearchMinor} tone="base" />}
          placeholder="Search"
          clearButton
          onClearButtonClick={() => handleFilterChange({ searchValue: "" })}
        />
      </div>
      <Card sectioned>
        <IndexTable
          resourceName={resourceName}
          itemCount={surveys.length}
          headings={[
            { title: "Name" },
            { title: "Type", alignment: "start" },
            { title: "Priority", alignment: "end" },
            { title: "Status", alignment: "start" },
            { title: "Visitors Reached", alignment: "end" },
            { title: "Number of responses", alignment: "end" },
            { title: "Actions" },
          ]}
          loading={surveyLoading.loading}
          emptyState={emptyStateMarkup}
          selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
          onSelectionChange={handleSelectionChange}
          bulkActions={bulkActions}
          selectable={true}
          lastColumnSticky={true}
        >
          {surveys.map((item, index) => {
            const { _id, name, priority, status, types, visitor_reached, responsesCompleted } =
              item;
            const isChoices = types.includes("choices");

            return (
              <IndexTable.Row
                id={_id}
                key={_id}
                position={index}
                selected={selectedResources.includes(_id)}
              >
                <IndexTable.Cell>{name}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="div" alignment="start">
                    <div style={{ display: "flex" }}>
                      <Icon source={isChoices ? ListMajor : ThumbsUpMajor} tone="base" />
                      <div style={{ flex: 1, marginLeft: "8px", textAlign: "left" }}>
                        {isChoices ? "Multiple choice" : "Like or Dislike"}
                      </div>
                    </div>
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="end">{priority}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="start">
                    {appPlanCode !== "free" ? (
                      <Badge tone={status && "success"}>
                        <strong>{status ? "Enabled" : "Disabled"}</strong>
                      </Badge>
                    ) : (
                      <Badge>
                        {" "}
                        <strong>Disabled</strong>
                      </Badge>
                    )}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="end">{visitor_reached}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="end">{responsesCompleted}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <ButtonGroup>
                    <Button
                      size="large"
                      icon={
                        appPlanCode === "free" ? (
                          <Icon source={EditMinor} tone="subdued" />
                        ) : (
                          <Icon source={EditMinor} tone="success" />
                        )
                      }
                      onClick={() => {
                        router.push({
                          pathname: `/surveys/${_id}`,
                          query: {
                            type: isChoices ? "multiple-choice" : "like-or-dislike",
                          },
                        });
                      }}
                      disabled={appPlanCode === "free"}
                    />
                    <Button
                      size="large"
                      icon={<Icon source={AnalyticsMinor} tone="base" />}
                      onClick={() => {
                        router.push({
                          pathname: `/surveys/results/${_id}`,
                          query: {
                            type: isChoices ? "multiple-choice" : "like-or-dislike",
                          },
                        });
                      }}
                    />
                    <Button
                      size="large"
                      icon={<Icon source={DeleteMinor} tone="critical" />}
                      onClick={() => {
                        setDeleteData({ id: _id, name });
                        handleToggleDeleteModal();
                      }}
                    />
                  </ButtonGroup>
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
        <DeleteModal
          resource={"survey"}
          resourceName={deleteData.name}
          active={surveyLoading.deleteModalActive}
          onClose={handleToggleDeleteModal}
          loading={surveyLoading.deleteLoading}
          onAction={handleDelete}
        />
      </Card>
      <br />
      <CursorPagination
        loading={surveyLoading.loading}
        currentPage={filter.currentPage}
        setCurrentPage={(newValue) => handleFilterChange({ currentPage: newValue })}
        total={filter.totalPage}
      />
    </>
  );
}
