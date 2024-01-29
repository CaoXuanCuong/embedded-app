import { LegacyCard, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";
import {
  Chart as ChartJs,
  Tooltip,
  Title,
  ArcElement,
  Legend,
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";
import styles from "./LineChart.module.css";
import FetchingData from "components/Skeleton/FetchingData";
import { getDaysArray } from "helpers/time.helper";

ChartJs.register(
  Tooltip,
  Title,
  ArcElement,
  Legend,
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
);

function compare(a, b) {
  if (a.created_at < b.created_at) {
    return -1;
  }
  if (a.created_at > b.created_at) {
    return 1;
  }
  return 0;
}

export default function LineChart({ title, data, loading }) {
  const [values, setValues] = useState([]);
  useEffect(() => {
    const dates = [];
    let first = null;
    let last = null;
    data.forEach((datum) => {
      let date = {};

      date.created_at = datum.createdAt.slice(0, 10);
      if (first === null) first = date.created_at;
      if (last === null) last = date.created_at;
      if (date.created_at > last) last = date.created_at;
      if (date.created_at < first) first = date.created_at;
      if (datum.quantity === 0) {
        date.quantity = 0;
      } else {
        date.quantity = 1;
      }
      dates.push(date);
    });

    getDaysArray(new Date(first), new Date(last)).forEach((date) => {
      dates.push({
        created_at: date.toISOString().slice(0, 10),
        quantity: 0,
      });
    });

    const result = dates.reduce((final, data) => {
      const isAlready = final.find((value) => value.created_at == data.created_at);
      if (!isAlready) {
        final.push(data);
      } else {
        const index = final.indexOf(isAlready);
        final[index].quantity += data.quantity;
      }
      return final;
    }, []);
    result.sort(compare);
    setValues(result);
  }, [data]);

  return (
    <div className={styles.msr_analytics__pie_chart}>
      <LegacyCard
        sectioned
        title={title !== undefined && title !== null ? <Text color="subdued">{title}</Text> : ""}
      >
        {loading ? (
          <FetchingData size={"large"} />
        ) : (
          <Line
            data={{
              datasets: [
                {
                  data: values.map((date) => {
                    return {
                      x: date.created_at,
                      y: parseInt(date.quantity),
                    };
                  }),
                  fill: false,
                  borderColor: "rgb(75, 192, 192)",
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "day",
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        )}
      </LegacyCard>
    </div>
  );
}
