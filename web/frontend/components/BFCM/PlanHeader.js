export default function PlanHeader({ appPlanCode, sub_bfcm, applyBfcm }) {
  return (
    <>
      {appPlanCode !== "advanced" && !sub_bfcm && applyBfcm ? (
        <tr className="pricing-plan-header bfcm-header">
          <th id="set-width-column" />
          <th className="price-info">
            <div className="price-now">
              <div className="price-now__heading">
                <span className="price-title only-mobile">Free</span>
              </div>
              <span>
                <span className="price-title only-desktop">Free</span>
              </span>
              {appPlanCode === "free" && <div className="current-plan">Current Plan</div>}
            </div>
          </th>
          <th className="price-info">
            <div className="price-now">
              <div className="price-now__heading">
                <span className="price-title only-mobile">Basic Plan</span>
              </div>
              <span>
                <span className="price-title only-desktop">Basic Plan</span>
                <div>
                  $10
                  <span className="period-small">/mo</span>
                </div>
              </span>
              {appPlanCode === "basic" ? <div className="current-plan">Current Plan</div> : <></>}
            </div>
          </th>
          <th className="price-info">
            <div className="price-now">
              <div className="price-now__heading">
                <span className="price-title only-mobile">Advanced</span>
              </div>
              <span>
                <span className="price-title only-desktop">Advanced Plan</span>
                <div>
                  <div className="price-regular">$30</div>$21
                  <span className="period-small">/mo</span>
                  <div className="sale-description">
                    <div>
                      Apply for <b>3 months</b>
                    </div>
                    <div>
                      Save <b>$27</b> in total
                    </div>
                  </div>
                </div>
              </span>
            </div>
            <div className="bfcm-current-plan"></div>
            <div className="current-plan bfcm-current-plan-text">SALE</div>
          </th>
        </tr>
      ) : (
        <tr className="pricing-plan-header">
          <th id="set-width-column" />
          <th className="price-info">
            <div className="price-now">
              <div className="price-now__heading">
                <span className="price-title only-mobile">FREE</span>
              </div>
              <span>
                <span className="price-title only-desktop">FREE:</span>
                <span className="price-small">$</span>0
              </span>
              <span className="period-small">/mo</span>
              {appPlanCode === "free" && <div className="current-plan">Current Plan</div>}
            </div>
          </th>
          <th className="price-info">
            <div className="price-now">
              <div className="price-now__heading">
                <span className="price-title only-mobile">BASIC</span>
              </div>
              <span>
                <span className="price-title only-desktop">BASIC:</span>
                <span className="price-small">$</span>10
              </span>
              <span className="period-small">/mo</span>
              {appPlanCode === "basic" ? <div className="current-plan">Current Plan</div> : <></>}
            </div>
          </th>
          <th className="price-info">
            <div className="price-now">
              <div className="price-now__heading">
                <span className="price-title only-mobile">ADVANCED</span>
              </div>
              <span>
                <span className="price-title only-desktop">ADVANCED:</span>
                <span className="price-small">$</span>30
              </span>
              <span className="period-small">/mo</span>
            </div>
            {appPlanCode === "advanced" && <div className="current-plan">Current Plan</div>}
          </th>
        </tr>
      )}
    </>
  );
}
