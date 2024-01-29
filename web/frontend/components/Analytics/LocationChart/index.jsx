import { Card, Box, Divider, ProgressBar, Scrollable, Text, BlockStack } from "@shopify/polaris";
import dynamic from "next/dynamic";
import countries from "public/static/data/world_countries.json";
import styles from "./LocationChart.module.css";
import Image from "next/image";
import { getCountryImage } from "helpers/image.helper";
import { getCountryName } from "helpers/country.helper";
import { useCallback, useEffect, useRef, useState } from "react";
import { scaleThreshold } from "d3-scale";
import { formatValueWithUnit } from "helpers/format.helper";

const ResponsiveChoropleth = dynamic(
  () => import("@nivo/geo").then((mod) => mod.ResponsiveChoropleth),
  { ssr: false },
);

export function LocationChart({ title, data, perList }) {
  const [options, setOptions] = useState({
    scale: 129,
    translation: [0.5, 0.7],
  });

  const geoWrapper = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (geoWrapper.current) {
        geoWrapper.current.style.height = geoWrapper.current.offsetWidth * 0.56 + "px";
        setOptions((prev) => ({
          ...prev,
          scale: geoWrapper.current.offsetWidth * 0.1356,
        }));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const colorScale = scaleThreshold()
    .domain([1, 10001, 50001, 200001, 500001, 1000001])
    .range(["#bcbdbd", "#8791d4", "#5f6dc5", "#4150b4", "#303b88", "#252e6a"]);

  const legendItems = useCallback(() => {
    let result = [];
    let prevValue = null;
    const domain = [1, 10000, 50000, 200000, 500000, 1000000];

    for (let i = 0; i < domain.length; i++) {
      const currentValue = formatValueWithUnit(domain[i]);

      if (!prevValue) {
        prevValue = currentValue;
      } else {
        result.push({
          id: i,
          label: `${prevValue} - ${currentValue}`,
          color: colorScale(domain[i]),
        });
        prevValue = currentValue;
      }
    }

    return result;
  }, [colorScale]);

  return (
    <Card>
      <Text variant="headingMd" as="h5">
        {title}
      </Text>
      <div className={styles.geo} ref={geoWrapper}>
        <div className={styles.wrapper}>
          <ResponsiveChoropleth
            data={data}
            features={countries.features}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            colors={colorScale}
            domain={[1, 10001, 50001, 200001, 500001, 1000001]}
            unknownColor="#bcbdbd"
            label="properties.name"
            valueFormat=".2~f"
            projectionScale={options?.scale}
            projectionTranslation={options?.translation}
            projectionRotation={[0, 0, 0]}
            enableGraticule={false}
            borderWidth={1}
            borderColor="#fdfdfd"
            legends={[
              {
                anchor: "bottom-left",
                direction: "column",
                justify: true,
                translateX: 20,
                translateY: -20,
                itemsSpacing: 0,
                itemWidth: 86,
                itemHeight: 16,
                itemDirection: "left-to-right",
                itemTextColor: "#444444",
                itemOpacity: 0.85,
                symbolSize: 16,
                data: legendItems(),
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000000",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </div>

      {/* List country */}
      <Divider />
      <div style={{ marginTop: "16px" }}></div>
      <Scrollable style={{ maxHeight: "236px" }}>
        <BlockStack gap="1">
          {perList?.length > 0
            ? perList.map(({ code, percent }, index) => (
                <Box key={`location-country-${index}`} padding="1">
                  <div className={styles.country}>
                    <div className={styles.flag}>
                      <Image
                        src={getCountryImage({ src: code })}
                        width="24"
                        height="18"
                        style={{ borderRadius: "2px" }}
                        alt="country"
                      />
                    </div>
                    <div className={styles.name}>
                      <Text truncate={true} variant="headingSm" as="div" alignment="start">
                        {getCountryName(code)}
                      </Text>
                    </div>
                    <div className={styles.progress}>
                      <ProgressBar progress={percent} size="small" />
                    </div>
                    <div className={styles.suffix}>
                      <Text variant="headingSm" as="div" alignment="end">
                        {percent}%
                      </Text>
                    </div>
                  </div>
                </Box>
              ))
            : null}
        </BlockStack>
      </Scrollable>
    </Card>
  );
}

LocationChart.defaultProps = {
  data: [{}],
  perList: [],
};
