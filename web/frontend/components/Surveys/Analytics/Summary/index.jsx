import {
  Card,
  LegacyStack,
  Badge,
  Grid,
  Icon,
  Layout,
  LegacyCard,
  Text,
  Tooltip,
  InlineStack,
} from "@shopify/polaris";
import { AlertMinor } from "@shopify/polaris-icons";
import { NumberCard } from "components/Analytics";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SingleDonutChart, SingleLineChart } from "..";
import { SimpleNormalizedChartViz } from "components/Analytics/Viz";

export function Summary({ type, data, fetchingData }) {
  const [showPresent, setShowPresent] = useState(false);

  const responseRate = useMemo(() => {
    let calc = data.count_response / data.count_visitor_reached;

    if (!isNaN(calc)) {
      return `${(calc * 100).toFixed(0)}%`;
    }
    return "No visitor reached";
  }, [type, data]);

  const donutChartData = useMemo(() => {
    if (type !== "multiple-choice") return;
    const { info, question, totalByChoice } = data;
    const choiceOptions = question?.options;
    if (!choiceOptions || !totalByChoice) return;

    const result = {
      name: info?.[0]?.name,
    };

    const isChangeChoice = totalByChoice?.some(
      (item) => !choiceOptions?.some((choice) => choice === item._id),
    );

    const uniqueCurrentChoices = new Set(choiceOptions);
    const currentChoices = Array.from(uniqueCurrentChoices);

    const combinedOptionsSet = new Set([
      ...choiceOptions,
      ...totalByChoice?.map((item) => item._id),
    ]);
    const combinedOptions = Array.from(combinedOptionsSet);

    result.total = combinedOptions?.map((item) => {
      return {
        name: item,
        data: [
          {
            key: "total",
            value: totalByChoice?.find((choice) => choice._id === item)?.count ?? 0,
          },
        ],
      };
    });

    if (isChangeChoice) {
      result.current = currentChoices?.map((item) => {
        return {
          name: item,
          data: [
            {
              key: "current",
              value: totalByChoice?.find((choice) => choice._id === item)?.count ?? 0,
            },
          ],
        };
      });
    }

    return result;
  }, [type, data]);

  const lineChartData = useMemo(() => {
    const dataRes = data.responseByDate ?? [];
    const startSurvey = data.createdAt ?? dataRes[0]?._id;
    const startTime = new Date(startSurvey).setHours(0, 0, 0, 0);
    const endTime = new Date().setHours(23, 59, 59, 999);

    const dateRange = [];
    for (let i = startTime; i <= endTime; i += 86400000) {
      dateRange.push(new Date(i).toLocaleDateString());
    }

    const responseByDate = dateRange.map((date) => {
      const item = dataRes.find((d) => new Date(d._id).toLocaleDateString() === date);
      return { key: date, value: item ? item.total : 0 };
    });

    if (responseByDate?.length === 1) {
      responseByDate = [{ key: "", value: 0 }, ...responseByDate, { key: "", value: 0 }];
    }

    return responseByDate;
  }, [type, data]);

  const toggleShowPresent = useCallback(() => {
    setShowPresent((prev) => !prev);
  }, [setShowPresent]);

  return (
    <>
      {/* Heading */}
      <Layout.Section>
        <div className="msr_analytics x_3">
          <LegacyStack>
            <LegacyStack.Item>
              <NumberCard
                title="Response rate"
                value={responseRate}
                loading={fetchingData.common}
              />
            </LegacyStack.Item>
            <LegacyStack.Item>
              <NumberCard
                title="Visitors reached"
                value={data.count_visitor_reached}
                loading={fetchingData.common}
              />
            </LegacyStack.Item>
            <LegacyStack.Item>
              <NumberCard
                title="Number of responses"
                value={data.count_response}
                loading={fetchingData.common}
              />
            </LegacyStack.Item>
          </LegacyStack>
        </div>
      </Layout.Section>

      {/* Chart */}
      {type === "like-or-dislike" ? (
        <>
          {/* <Layout.Section>
            <div className={`msr_analytics x_${data.options.length}`}>
              <LegacyStack>
                {data.options.map((result, index) => {
                  const key = Object.keys(result);
                  return (
                    <LegacyStack.Item key={index}>
                      <NumberCard title={key[0]} value={result[key[0]]} loading={fetching.common} />
                    </LegacyStack.Item>
                  );
                })}
              </LegacyStack>
            </div>
          </Layout.Section> */}
          <Layout.Section>
            <div className="msr_analytics x_1">
              <SimpleNormalizedChartViz
                title={"Percentage"}
                data={data.totalByChoice}
                loading={fetchingData.chart}
              />
            </div>
          </Layout.Section>
          <Layout.Section>
            <div className="msr_analytics x_1">
              <SingleLineChart
                title="Responses"
                name="Number of responses"
                state={fetchingData.chart}
                data={lineChartData}
              />
            </div>
          </Layout.Section>
        </>
      ) : null}

      {type === "multiple-choice" ? (
        <Layout.Section>
          <SingleLineChart
            title="Responses"
            name="Number of responses"
            state={fetchingData.chart}
            data={lineChartData}
          />
        </Layout.Section>
      ) : null}

      {/* Donut chart */}
      {type === "multiple-choice" ? (
        <Layout.Section>
          <Card>
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, lg: showPresent ? 6 : 12 }}>
                <LegacyCard sectioned>
                  <SingleDonutChart
                    title={donutChartData?.name}
                    data={donutChartData?.total}
                    state={fetchingData.chart}
                    text={data?.question?.heading}
                    action={{
                      show: !showPresent && donutChartData?.current,
                      label: "Show Current choices",
                      onClick: toggleShowPresent,
                    }}
                    badge={
                      <Tooltip content="Total choices since this survey was created.">
                        <Badge tone="info">
                          <InlineStack blockAlign="center">
                            <Text>Total</Text>
                            <div className="Survey__Icon--custom">
                              <Icon color="highlight" source={AlertMinor} />
                            </div>
                          </InlineStack>
                        </Badge>
                      </Tooltip>
                    }
                  />
                </LegacyCard>
              </Grid.Cell>
              {donutChartData?.current && showPresent ? (
                <>
                  <Grid.Cell columnSpan={{ xs: 6, lg: showPresent ? 6 : 12 }}>
                    <LegacyCard sectioned>
                      <SingleDonutChart
                        title={donutChartData?.name}
                        data={donutChartData?.current}
                        state={fetchingData.chart}
                        text={data?.question?.heading}
                        action={{
                          show: true,
                          label: "Hide Current choices",
                          onClick: toggleShowPresent,
                        }}
                        badge={
                          <Tooltip content="Your current choices only.">
                            <Badge tone="success">
                              <InlineStack blockAlign="center">
                                <Text>Current</Text>
                                <div className="Survey__Icon--custom">
                                  <Icon color="success" source={AlertMinor} />
                                </div>
                              </InlineStack>
                            </Badge>
                          </Tooltip>
                        }
                      />
                    </LegacyCard>
                  </Grid.Cell>
                </>
              ) : null}
            </Grid>
          </Card>
        </Layout.Section>
      ) : null}
    </>
  );
}
