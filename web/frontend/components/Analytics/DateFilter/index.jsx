import { DatePicker, InlineStack, Select } from "@shopify/polaris";
import { useCallback, useState } from "react";
import styles from "./DateFilter.module.css";

export default function DateFilter({
  disabled,
  option,
  options,
  handleChangeOption,
  startDate,
  startMinus1Date,
  endDate,
}) {
  const now = new Date();
  const [{ month, year }, setDate] = useState({
    month: now.getMonth(),
    year: now.getFullYear(),
  });

  const [selectedDates, setSelectedDates] = useState({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const handleMonthChange = useCallback((month, year) => setDate({ month, year }), []);

  return (
    <div className={styles.msr_analytics__date_filter}>
      <InlineStack>
        <>
          <Select
            disabled={disabled}
            label="Range"
            labelInline
            options={options}
            onChange={handleChangeOption}
            value={option}
          />
        </>
        {option === "custom" && (
          <>
            <DatePicker
              month={month}
              year={year}
              multiMonth
              allowRange
              disableDatesAfter={new Date(endDate)}
              disableDatesBefore={new Date(startMinus1Date)}
              onChange={setSelectedDates}
              onMonthChange={handleMonthChange}
              selected={selectedDates}
            />
          </>
        )}
      </InlineStack>
    </div>
  );
}
