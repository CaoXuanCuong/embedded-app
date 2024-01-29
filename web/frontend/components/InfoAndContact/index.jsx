import { List, Link, Card, Button, InlineStack, Grid, Text, BlockStack } from "@shopify/polaris";
import styles from "./styles.module.css";

export default function InfoAndContact() {
  return (
    <div className={styles.wrapper}>
      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <Card>
            <BlockStack gap={300}>
              <InlineStack align="center">
                <Text variant="headingMd" as="h6" fontWeight="semibold">
                  Book a demo live
                </Text>
              </InlineStack>
              <List gap="loose">
                <List.Item>
                  <Text>
                    <Link
                      target="_blank"
                      url={"https://calendly.com/shopify-admin/b2c-solution-demo"}
                    >
                      <Text as="span" fontWeight="semibold">
                        Book a Live Demo:
                      </Text>
                    </Link>{" "}
                    walk you through and answer your questions with our Sales Rep.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text as="p">
                    Check here for a{" "}
                    <Link
                      target="_blank"
                      url={"https://demo-mida-session-recording.myshopify.com/"}
                    >
                      <Text as="span" fontWeight="semibold">
                        Live Demo
                      </Text>
                    </Link>{" "}
                    (password: 1).
                  </Text>
                </List.Item>
                <List.Item>
                  <Text as="p">
                    If you meet any issues, feel free to contact us via chat or drop a ticket at{" "}
                    <Text as="span" fontWeight="semibold">
                      support-sbc@bsscommerce.com
                    </Text>
                    .
                  </Text>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <Card>
            <BlockStack gap={"600"}>
              <BlockStack gap={300}>
                <InlineStack align="center">
                  <Text variant="headingMd" as="h6" fontWeight="semibold">
                    Want to build a thriving B2B online store with Shopify Plus?
                  </Text>
                </InlineStack>
                <Text>
                  <Link
                    target="_blank"
                    url="https://bsscommerce.com/shopify/shopify-plus-development-service/?utm_source=b2b-apps&utm_medium=dashboard&utm_campaign=services"
                  >
                    <Text as="span" fontWeight="semibold">
                      Let’s share with us your needs
                    </Text>
                  </Link>{" "}
                  and our Shopify Plus experts will work with you to give you cost-effective
                  solution.
                </Text>
              </BlockStack>
              <InlineStack align="center">
                <Button
                  url="https://bsscommerce.com/shopify/shopify-plus-development-service/?utm_source=b2b-apps&utm_medium=dashboard&utm_campaign=services"
                  target="_blank"
                  size="large"
                  variant="primary"
                >
                  Check here
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Grid.Cell>
      </Grid>
    </div>
  );
}
