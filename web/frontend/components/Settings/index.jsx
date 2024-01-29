import { Layout } from "@shopify/polaris";
import ExcludeVisitorSettings from "./ExcludeVisitorSettings";
import ReplaySettings from "./ReplaySettings";
import SessionSettings from "./SessionSettings";
// import SessionTarget from "./SessionTarget";

export default function Settings() {
  return (
    <Layout>
      <ReplaySettings />
      <ExcludeVisitorSettings />
      {/* <SessionTarget /> */}
      <SessionSettings />
    </Layout>
  );
}
