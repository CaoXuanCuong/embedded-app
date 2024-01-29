import {
  Box,
  Button,
  DatePicker,
  InlineGrid,
  InlineStack,
  Icon,
  OptionList,
  Popover,
  Scrollable,
  TextField,
  BlockStack,
  useBreakpoints,
} from "@shopify/polaris";
import { ArrowRightMinor, CalendarMinor } from "@shopify/polaris-icons";
import {
  formatDate,
  isValidDate,
  nodeContainsDescendant,
  parseYearMonthDayDateString,
  renderActiveContent,
} from "helpers/date.helper";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DateRangePicker.module.css";
import { ButtonGroup } from "@shopify/polaris";

export function DateRangePicker({ ranges, activeOption, disableAfter, disableBefore, onApply }) {
  const { mdDown, lgUp } = useBreakpoints();
  const shouldShowMultiMonth = lgUp;
  const [inputValues, setInputValues] = useState({});
  const [popoverActive, setPopoverActive] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState(activeOption ? activeOption : ranges[0]);
  const [{ month, year }, setDate] = useState({
    month: new Date(activeDateRange.period.since).getMonth(),
    year: new Date(activeDateRange.period.since).getFullYear(),
  });

  const datePickerRef = useRef(null);
  const actionPickerRef = useRef(null);

  const handleStartInputValueChange = (value) => {
    setInputValues((prevState) => {
      return { ...prevState, since: value };
    });
    if (isValidDate(value)) {
      const newSince = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newSince <= prevState.period.until
            ? { since: newSince, until: prevState.period.until }
            : { since: newSince, until: newSince };
        return {
          ...prevState,
          title: "Custom",
          alias: "custom",
          period: newPeriod,
        };
      });
    }
  };

  const handleEndInputValueChange = (value) => {
    setInputValues((prevState) => ({ ...prevState, until: value }));
    if (isValidDate(value)) {
      const newUntil = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newUntil >= prevState.period.since
            ? { since: prevState.period.since, until: newUntil }
            : { since: newUntil, until: newUntil };
        return {
          ...prevState,
          title: "Custom",
          alias: "custom",
          period: newPeriod,
        };
      });
    }
  };

  const handleMonthChange = (month, year) => {
    if (year >= new Date().getFullYear() && month > new Date().getMonth()) return;
    setDate({ month, year });
  };

  const handleCalendarChange = ({ start, end }) => {
    const newDateRange = ranges.find((range) => {
      return (
        range.period.since.valueOf() === start.valueOf() &&
        range.period.until.valueOf() === end.valueOf()
      );
    }) || {
      alias: "custom",
      title: "Custom",
      period: {
        since: start,
        until: end,
      },
    };
    setActiveDateRange(newDateRange);
  };

  useEffect(() => {
    if (activeDateRange) {
      setInputValues({
        since: formatDate(new Date(activeDateRange.period.since)),
        until: formatDate(new Date(activeDateRange.period.until)),
      });
      setDate({
        month: new Date(activeDateRange.period.until).getMonth(),
        year: new Date(activeDateRange.period.until).getFullYear(),
      });
    }
  }, [activeDateRange]);

  const handleInputBlur = ({ relatedTarget }) => {
    const isRelatedTargetWithinPopover =
      relatedTarget != null && isNodeWithinPopover(relatedTarget);
    if (isRelatedTargetWithinPopover) {
      return;
    }
    setPopoverActive(false);
  };

  const isNodeWithinPopover = (node) => {
    const isDatePicker = datePickerRef?.current
      ? nodeContainsDescendant(datePickerRef.current, node)
      : false;
    const isActionPicker = actionPickerRef?.current
      ? nodeContainsDescendant(actionPickerRef.current, node)
      : false;
    return isDatePicker || isActionPicker;
  };

  const handleCancel = () => {
    setPopoverActive(false);
  };

  const handleApplyDate = () => {
    setPopoverActive(false);

    if (!onApply) return;
    if (activeDateRange.alias === "custom") {
      activeDateRange.period.until = new Date(
        new Date(activeDateRange.period.until).setHours(23, 59, 59, 999),
      );
    }
    onApply(activeDateRange);
  };

  return (
    <Popover
      active={popoverActive}
      autofocusTarget="none"
      preferredAlignment="left"
      preferredPosition="below"
      fluidContent
      sectioned={false}
      fullHeight
      activator={
        <Button icon={CalendarMinor} fullWidth onClick={() => setPopoverActive(!popoverActive)}>
          {renderActiveContent(activeDateRange)}
        </Button>
      }
      onClose={() => setPopoverActive(false)}
    >
      <Popover.Pane>
        <div ref={datePickerRef} style={{ minHeight: "330px" }}>
          <InlineGrid
            columns={{
              xs: "1fr",
              mdDown: "1fr",
              md: "max-content max-content",
            }}
            gap={0}
          >
            <Box padding={300} paddingBlockEnd={{ xs: 100, md: 0 }}>
              <Scrollable style={{ maxHeight: "334px" }}>
                <OptionList
                  options={ranges.map((range) => ({
                    value: range.alias,
                    label: range.title,
                  }))}
                  selected={activeDateRange.alias}
                  onChange={(value) => {
                    setActiveDateRange(ranges.find((range) => range.alias === value[0]));
                  }}
                />
              </Scrollable>
            </Box>

            <div className={styles.divider}>
              <Box
                paddingBlock={{ xs: 300 }}
                paddingInline={{ xs: 400 }}
                maxWidth={mdDown ? "320px" : "516px"}
              >
                <BlockStack gap="400">
                  <InlineStack gap="200" wrap={mdDown ? true : false}>
                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        role="combobox"
                        label={"Since"}
                        labelHidden
                        prefix={<Icon source={CalendarMinor} />}
                        value={inputValues.since}
                        onChange={handleStartInputValueChange}
                        onBlur={handleInputBlur}
                        autoComplete="off"
                      />
                    </div>
                    <Icon source={ArrowRightMinor} />
                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        role="combobox"
                        label={"Until"}
                        labelHidden
                        prefix={<Icon source={CalendarMinor} />}
                        value={inputValues.until}
                        onChange={handleEndInputValueChange}
                        onBlur={handleInputBlur}
                        autoComplete="off"
                      />
                    </div>
                  </InlineStack>
                  <div>
                    <DatePicker
                      month={month}
                      year={year}
                      selected={{
                        start: new Date(activeDateRange.period.since),
                        end: new Date(activeDateRange.period.until),
                      }}
                      onMonthChange={handleMonthChange}
                      onChange={handleCalendarChange}
                      multiMonth={shouldShowMultiMonth}
                      disableDatesAfter={disableAfter}
                      disableDatesBefore={disableBefore}
                      allowRange
                    />
                  </div>
                </BlockStack>
              </Box>
            </div>
          </InlineGrid>
        </div>
      </Popover.Pane>
      <Popover.Pane fixed>
        <Box paddingBlock={200} borderColor="border" borderWidth="025">
          <div ref={actionPickerRef}>
            <Popover.Section>
              <InlineStack align="end">
                <ButtonGroup>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button variant="primary" fullWidth onClick={handleApplyDate}>
                    Apply
                  </Button>
                </ButtonGroup>
              </InlineStack>
            </Popover.Section>
          </div>
        </Box>
      </Popover.Pane>
    </Popover>
  );
}
