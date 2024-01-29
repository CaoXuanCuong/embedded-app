import { LegacyCard, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { Chart as ChartJs, Tooltip, Title, ArcElement, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import FetchingData from "components/Skeleton/FetchingData";
import { getRandomColor } from "helpers/color.helper";
import styles from "./PieChart.module.css";

ChartJs.register(Tooltip, Title, ArcElement, Legend);

export default function NumberCard({ title, data, loading }) {
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    setLabels(Object.keys(data));
    setValues(Object.values(data));
    const pallette = [];
    for (let i = 0; i < Object.keys(data).length; i++) {
      pallette.push(getRandomColor());
    }
    setColors([...pallette]);
  }, [data]);

  return (
    <div className={styles.msr_analytics__pie_chart}>
      <LegacyCard
        sectioned
        title={
          title !== undefined && title !== null ? (
            <Text as="span" color="subdued">
              {title}
            </Text>
          ) : (
            ""
          )
        }
      >
        {loading ? (
          <FetchingData size={"large"} />
        ) : (
          <Pie
            data={{
              labels: labels,
              datasets: [
                {
                  data: values,
                  backgroundColor: colors,
                  hoverBackgroundColor: colors,
                  hoverOffset: 4,
                },
              ],
            }}
            width={"50%"}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  align: "center",
                  labels: {
                    usePointStyle: true,
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
