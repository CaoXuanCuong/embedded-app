import { Spinner } from "@shopify/polaris";
export default function FetchingData({ size = "small", align = "center" }) {
  const ALIGNS = {
    center: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={ALIGNS[align]}>
      <Spinner size={size} />
    </div>
  );
}
