import { Grid } from "@shopify/polaris";
import { DateRangePicker } from "components/Analytics";
import { getDatePickerOption } from "helpers/date.helper";
import { useCallback, useEffect, useMemo } from "react";
import { CursorPagination } from "components/Pagination";
import { FeedbackCard } from "..";

export function AdditionalFeedback({ data, loading, pagination, filter, onFilterChange }) {
  const dateOptions = useMemo(() => {
    return getDatePickerOption();
  }, []);

  useEffect(() => {
    if (!filter.dateOption) {
      onFilterChange({ ...filter, dateOption: dateOptions[0] });
    }
  }, []);

  const handleApplyDate = useCallback(
    (newOption) => {
      onFilterChange({ ...filter, page: 1, dateOption: newOption });
    },
    [filter],
  );

  const handlePageChange = useCallback(
    (newPage) => {
      onFilterChange({ ...filter, page: newPage });
    },
    [filter],
  );

  return (
    <Grid>
      <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
        <div className="analytic-filter">
          <DateRangePicker
            activeOption={filter?.dateOption}
            ranges={dateOptions}
            disableAfter={new Date()}
            onApply={handleApplyDate}
          />
        </div>
      </Grid.Cell>

      {/* Card */}
      {data.length > 0
        ? data.map((item, index) => {
            return (
              <Grid.Cell key={index} columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                <FeedbackCard data={item} />
              </Grid.Cell>
            );
          })
        : null}

      {/* Pagination */}
      <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
        <CursorPagination
          setCurrentPage={handlePageChange}
          currentPage={pagination?.page}
          total={Math.ceil(pagination?.totalRecords / pagination?.limit)}
          loading={loading}
        />
      </Grid.Cell>
    </Grid>
  );
}
