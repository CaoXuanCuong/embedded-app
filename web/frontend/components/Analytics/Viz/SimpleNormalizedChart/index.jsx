import { Card, Text } from "@shopify/polaris";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const SimpleNormalizedChart = dynamic(
  () => import("@shopify/polaris-viz").then((mod) => mod.SimpleNormalizedChart),
  {
    ssr: false,
  },
);

export function SimpleNormalizedChartViz({ title, data }) {
  const chartContainerRef = useRef(null);
  let transformedData = [
    {
      name: "Like",
      data: [
        {
          key: "Like",
          value: 0,
        },
      ],
      color: "#C65865",
    },
    {
      name: "Dislike",
      data: [
        {
          key: "Dislike",
          value: 0,
        },
      ],
      color: "#579EBF",
    },
  ];

  if (data && data.length > 0) {
    data.map((chartData) => {
      if (chartData._id == "Like") {
        transformedData[0].data[0].value = chartData.count;
      } else if (chartData._id == "Dislike") {
        transformedData[1].data[0].value = chartData.count;
      }
    });
  }

  useEffect(() => {
    const calculatePercentage = () => {
      const chartContainer = chartContainerRef.current;

      if (chartContainer) {
        const segmentDivs = chartContainer.querySelectorAll("._Segment_14e18_150");
        let totalWidth = 0;
        if (segmentDivs.length > 0) {
          segmentDivs.forEach((segmentDiv) => {
            const width = parseFloat(segmentDiv.style.width);
            totalWidth += width;
          });

          segmentDivs.forEach((segmentDiv) => {
            const width = parseFloat(segmentDiv.style.width);
            const percentage = (width / totalWidth) * 100;
            const newDiv = document.createElement("div");
            newDiv.textContent = `${Math.round(percentage)}%`;
            newDiv.classList.add("normalized_chart_content");
            if (transformedData[0].data[0].value == 0 && transformedData[1].data[0].value == 0) {
              newDiv.textContent = "0%";
              newDiv.style.backgroundColor = "rgb(122, 122, 122)";
            }
            segmentDiv.appendChild(newDiv);
          });
        }
      }
    };

    const timeout = setTimeout(calculatePercentage, 1000);

    return () => clearTimeout(timeout);
  }, [data]);

  return (
    <Card>
      <Text variant="headingMd" as="h5">
        {title}
      </Text>

      <div
        ref={chartContainerRef}
        style={{ marginTop: "14px", height: "150px" }}
        className="normalized_chart"
      >
        <SimpleNormalizedChart
          data={transformedData}
          theme="Light"
          size="large"
          legendPosition="top"
        />
      </div>
    </Card>
  );
}
