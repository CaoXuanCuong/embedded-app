import {
  Button,
  ButtonGroup,
  Card,
  EmptySearchResult,
  Icon,
  IndexTable,
  Tooltip,
  InlineStack,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { PlayMinor, QuestionMarkMinor, ReplayMinor, ViewMajor } from "@shopify/polaris-icons";
import ImageComponent from "components/ImageComponent";
import { CursorPagination } from "components/Pagination";
import { getSurveyOptionImage } from "helpers/image.helper";
import { formatDateLocale } from "helpers/time.helper";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchData } from "services/swr.service";
import { STATUS_ICON } from "consts/SurveyQuestion.const";
import styles from "./Survey.module.css";

export default function ResponseTable({ jwt }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [responses, setResponses] = useState([]);

  const router = useRouter();
  const {
    query: { id },
  } = router;

  const resourceName = {
    singular: "response",
    plural: "responses",
  };

  const emptyStateMarkup = <EmptySearchResult title={"No responses yet"} withIllustration />;

  const { data, isLoading } = useSWR(
    [
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveyResponses?id=${id}&page=${currentPage}&type=like-or-dislike`,
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
      setResponses(data.payload);
      setTotalPage(data.total);
      setCurrentPage(data.current);
    }
  }, [jwt, data]);

  return (
    <>
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={responses.length}
          emptyState={emptyStateMarkup}
          loading={isLoading}
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
                  <InlineStack>
                    <div>Status</div>
                    <Icon source={QuestionMarkMinor} tone="base" />
                  </InlineStack>
                </Tooltip>
              ),
              alignment: "center",
            },
            { title: "Answer" },
            { title: "Actions" },
          ]}
          selectable={false}
        >
          {responses.map((item, index) => {
            const { _id, visitor, session, vote, text, createdAt, status } = item;
            const updatedStatus = vote ? "completed" : status;
            return (
              <IndexTable.Row id={_id} key={_id} position={index}>
                <IndexTable.Cell>{visitor}</IndexTable.Cell>
                <IndexTable.Cell>{formatDateLocale(createdAt)}</IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="center">
                    <Icon
                      source={STATUS_ICON[updatedStatus]?.icon}
                      tone={STATUS_ICON[updatedStatus]?.color}
                    />
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <div className="msr-option-image">
                    <ImageComponent loader={getSurveyOptionImage} src={vote} width={25} />
                  </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <ButtonGroup>
                    {session?._id ? (
                      <Button
                        icon={
                          <Icon source={session?.viewed ? ReplayMinor : PlayMinor} tone="success" />
                        }
                        disabled={!session?._id ? true : false}
                        onClick={() => {
                          router.push(`/replays/${session?._id}`);
                        }}
                      >
                        {session?.viewed ? "Replay" : "Play"}
                      </Button>
                    ) : (
                      <Tooltip
                        content={!session?._id ? `Session has been deleted` : null}
                        dismissOnMouseOut
                      >
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
                    <Button
                      icon={<Icon source={ViewMajor} tone="success" />}
                      onClick={() => {
                        router.push(`/visitors/${visitor}`);
                      }}
                    >
                      View Visitor
                    </Button>
                  </ButtonGroup>
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
      </Card>
      <br />
      <CursorPagination
        loading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        total={totalPage}
      />
      <br />
    </>
  );
}
