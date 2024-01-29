import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  EmptySearchResult,
  Icon,
  IndexTable,
  InlineStack,
  Text,
  Tooltip,
} from "@shopify/polaris";
import { PlayMinor, QuestionMarkMinor, ReplayMinor } from "@shopify/polaris-icons";
import { CursorPagination } from "components/Pagination";
import { STATUS_ICON } from "consts/SurveyQuestion.const";
import { formatDateLocale } from "helpers/time.helper";
import { useCallback } from "react";
import styles from "./VisitorChoiceTable.module.css";
import { useRouter } from "next/router";

export function VisitorChoiceTable({ loading, visitors, totalPage, filter, onFilterChange }) {
  const router = useRouter();

  const handlePageChange = useCallback(
    (newPage) => {
      if (!onFilterChange) return;
      onFilterChange({ ...filter, page: newPage });
    },
    [filter],
  );
  return (
    <>
      <Card>
        <IndexTable
          resourceName={{
            singular: "response",
            plural: "responses",
          }}
          itemCount={visitors.length}
          emptyState={<EmptySearchResult title={"No responses yet"} withIllustration />}
          loading={loading}
          headings={[
            { title: "Visitor ID" },
            { title: "Date/Time" },
            {
              title: (
                <Tooltip
                  padding="300"
                  content={
                    <BlockStack gap={100}>
                      <div className={styles.tooltip}>
                        <div className={styles.title}>Viewed: &nbsp;</div>
                        <Icon
                          source={STATUS_ICON["viewed"].icon}
                          tone={STATUS_ICON["viewed"].color}
                        />
                      </div>
                      <div className={styles.tooltip}>
                        <div className={styles.title}>Dismissed: &nbsp;</div>
                        <Icon
                          source={STATUS_ICON["dismissed"].icon}
                          tone={STATUS_ICON["dismissed"].color}
                        />
                      </div>
                      <div className={styles.tooltip}>
                        <div className={styles.title}>Completed: &nbsp;</div>
                        <Icon
                          source={STATUS_ICON["completed"].icon}
                          tone={STATUS_ICON["completed"].color}
                        />
                      </div>
                    </BlockStack>
                  }
                >
                  <InlineStack gap={100}>
                    <Text>Status</Text>
                    <div>
                      <Icon source={QuestionMarkMinor} tone="base" />
                    </div>
                  </InlineStack>
                </Tooltip>
              ),
              alignment: "center",
            },
            { title: "Choices" },
            { title: "Action" },
          ]}
          selectable={false}
        >
          {visitors.map((item, index) => {
            const { _id, visitor, session, choices, status, createdAt } = item;
            const sessionId = session?._id;

            return (
              <IndexTable.Row id={_id} key={_id} position={index}>
                <IndexTable.Cell>{visitor}</IndexTable.Cell>
                <IndexTable.Cell>{formatDateLocale(createdAt)}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="center">
                    <Icon source={STATUS_ICON[status]?.icon} tone={STATUS_ICON[status]?.color} />
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{choices?.join(", ")}</IndexTable.Cell>
                <IndexTable.Cell>
                  <ButtonGroup>
                    {sessionId ? (
                      <Button
                        icon={
                          <Icon source={session?.viewed ? ReplayMinor : PlayMinor} tone="success" />
                        }
                        onClick={() => {
                          router.push(`/replays/${session?._id}`);
                        }}
                      >
                        {session?.viewed ? "Replay" : "Play"}
                      </Button>
                    ) : (
                      <Tooltip content="Session has been deleted">
                        <Button
                          icon={
                            <Icon source={session?.viewed ? ReplayMinor : PlayMinor} tone="base" />
                          }
                          disabled
                        >
                          {session?.viewed ? "Replay" : "Play"}
                        </Button>
                      </Tooltip>
                    )}
                  </ButtonGroup>
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
      </Card>
      <br />
      <CursorPagination
        setCurrentPage={handlePageChange}
        currentPage={filter?.page}
        total={totalPage}
        loading={loading}
      />
      <br />
    </>
  );
}

VisitorChoiceTable.defaultProps = {
  visitors: [],
  totalPage: 1,
};
