import { Modal, Text } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import styles from "./RecordingNotiModal.module.css";
import Image from "next/image";
import BannerReviewMida from "../../public/images/banner_review_mida.png";
import React from "react";
import { useRouter } from "next/router";
import { selectShop } from "redux/reducers/general.reducer";
import { useSelector } from "react-redux";

export default function RecordingNotiModal() {
  const { countTotalSession } = useSelector(selectShop);
  const router = useRouter();
  const handleChange = useCallback(() => {
    setActive(false);
    sessionStorage.setItem("modalBanner", false);
  });
  const handlePlanButton = useCallback(() => {
    router.push("/replays");
  }, []);

  const [active, setActive] = useState(() => {
    if (
      ((countTotalSession == 1 && !localStorage.getItem("show_crisp_first_recording")) ||
        (countTotalSession == 10 && !localStorage.getItem("show_crisp_ten_first_recordings"))) &&
      !sessionStorage.getItem("modalBanner")
    ) {
      return true;
    }
    return false;
  });

  return (
    <div className="mida-modal-test" data-mida="123">
      <Modal
        open={active}
        onClose={handleChange}
        title="Banner mida review"
        titleHidden
        small="true"
      >
        <Modal.Section>
          <div id={styles.overlay}>
            <div className={styles.card}>
              <div className={styles.card_header}>
                <Image className={styles.image} src={BannerReviewMida} alt="image banner" />
                <span className={styles.close_btn} onClick={handleChange}>
                  {" "}
                  <div className={styles.btn__dismiss}>X</div>
                </span>
              </div>
              <div className={styles.card_body}>
                {countTotalSession == 1 ? (
                  <>
                    <Text variant="heading3xl" as="h2">
                      First recording!
                    </Text>
                    <Text variant="headingMd" fontWeight="regular" as="p">
                      Congratulations, you got the first record session. Let’s see what your visitor
                      is doing on your storefront.
                    </Text>
                  </>
                ) : countTotalSession == 10 ? (
                  <>
                    <Text variant="heading3xl" as="h2">
                      Keep dive into insight!
                    </Text>
                    <Text variant="headingMd" fontWeight="regular" as="p">
                      You got first 10 record sessions to watch. Let’s watch record sessions and
                      optimize your purchase flow!
                    </Text>
                  </>
                ) : (
                  ""
                )}

                <div className={styles.card_body_action}>
                  <button className={styles.btn__primary} onClick={handlePlanButton}>
                    Check Your Record
                  </button>
                  <button className={styles.btn__cancel} onClick={handleChange}>
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
}
