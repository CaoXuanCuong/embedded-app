import { Badge, BlockStack, Button, Card, Tooltip } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { isBasic } from "helpers/plan.helper";
import Link from "next/link";

export default function ModuleControl({
  jwt,
  moduleName,
  moduleCode,
  onToggleToast,
  onToastMessage,
  currentPlan,
  needRestrict = false,
}) {
  const modules = {
    sv: {
      isBasic,
      restrictText: "Available for Basic Plan",
    },
  };
  const [moduleStatus, setModuleStatus] = useState(false);
  const [moduleStatusLoading, setModuleStatusLoading] = useState(true);
  const handleToggleModule = useCallback(async () => {
    setModuleStatusLoading(true);
    try {
      const res = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/modules/v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          module: moduleCode,
          status: !moduleStatus,
        }),
      });
      const { data } = await res.json();
      if (!data) {
        onToastMessage("Failed");
        return;
      }
      setModuleStatus(data.status);
      onToastMessage("Successfully");
    } catch {
      onToastMessage("Failed");
    }
    onToggleToast();
    setModuleStatusLoading(false);
  }, [jwt, moduleStatus, onToggleToast, moduleCode, onToastMessage]);

  const getModules = useCallback(async () => {
    const moduleRes = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/modules/${moduleCode}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    const moduleJson = await moduleRes.json();
    if (moduleJson && (moduleJson.statusCode === 200 || moduleJson === 404)) {
      setModuleStatus(moduleJson.payload.status);
    }
    setModuleStatusLoading(false);
  }, [moduleCode, jwt]);

  useEffect(() => {
    getModules();
  }, [getModules]);

  const isRestrict = needRestrict ? (
    !modules[moduleCode].isBasic(currentPlan) ? (
      <Link href={`/plans`}>{modules[moduleCode].restrictText}</Link>
    ) : null
  ) : null;
  return (
    <Card>
      <div className="mida-dashboard-card">
        <div className="module-status">
          {moduleName} is{" "}
          <Badge tone={moduleStatus && "success"}>
            <strong>{moduleStatus ? "enabled" : "disabled"}</strong>
          </Badge>
        </div>
        <div className="module-btn">
          <BlockStack gap={100}>
            <Tooltip
              content={isRestrict !== null ? `Upgrade Plan to Enable Survey` : ""}
              width={1}
              dismissOnMouseOut
              active={isRestrict !== null}
            >
              <Button
                loading={moduleStatusLoading}
                onClick={handleToggleModule}
                disabled={isRestrict === null ? false : true}
                size="large"
              >
                {moduleStatus ? "Disable" : "Enable"}
              </Button>
            </Tooltip>
            {isRestrict}
          </BlockStack>
        </div>
      </div>
    </Card>
  );
}
