import { Banner } from "@shopify/polaris";

export default function TempBanner({ date }) {
  return new Date(date).getTime() > Date.now() ? (
    <Banner title="INFORMATION" tone="warning">
      <p>Dear FREE merchants, we are going to update our pricing plan within the next few days:</p>
      <ul>
        <li>
          FREE Plan: Since February, the visitor quota will be 400 visitors/month instead of 1000
          visitors/month. However, you can request our team to reset the data one time per month.
        </li>
        <li>
          Basic Plan ($10/month): The visitor quota will be 2000 visitors/month. With this plan, you
          can request our team to reset the data three times per month
        </li>
        <li>
          Advanced Plan ($30/month): The visitor quota will be 10000 visitors/month. With this plan,
          you can request our team to reset the data anytime you want (unlimited).
        </li>
      </ul>
      <p>
        We do appreciate a lot for your support and for staying with our app so far. Also, we are
        open to receiving any problems or feature requests to improve our MIDA Sessions Recording
        app.
      </p>
    </Banner>
  ) : null;
}
