import { Button, Pagination, Icon, InlineStack, Spinner } from "@shopify/polaris";
import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./Pagination.module.css";
import { CaretUpMinor } from "@shopify/polaris-icons";
const SESSION_PER_PAGE_LIST = [10, 20, 30, 50];

function SessionsPerPageList({ currentPage, setCurrentPage, setSessionsPerPage }) {
  const [open, setOpen] = useState(false);
  const index = useMemo(() => {
    let sessionsPerPage = sessionStorage.getItem("sessionsPerPage");
    if (!sessionsPerPage) {
      sessionsPerPage = SESSION_PER_PAGE_LIST[0];
      sessionStorage.setItem("sessionsPerPage", sessionsPerPage);
    }
    return SESSION_PER_PAGE_LIST.indexOf(Number(sessionsPerPage));
  }, []);

  const [listIndex, setListIndex] = useState(index);
  const handleOpen = () => {
    setOpen(!open);
  };
  const menuRef = useRef();
  useEffect(() => {
    let handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const handleItemSelected = (index) => {
    setListIndex(index);
    const sessionsPerPage = SESSION_PER_PAGE_LIST[index];
    sessionStorage.setItem("sessionsPerPage", sessionsPerPage);
    setCurrentPage(1);
    setSessionsPerPage(index);
    setOpen(false);
  };

  return (
    <div className={styles.dropdown} ref={menuRef}>
      <div className={open ? styles.btn_dropdown_active : styles.btn_dropdown} onClick={handleOpen}>
        <span className={styles.session_page}>{SESSION_PER_PAGE_LIST[listIndex]}/page</span>
        <Icon source={CaretUpMinor} tone={open ? "subdued" : "base"} />
      </div>
      {open && (
        <ul className={styles.dropdown_menu}>
          {SESSION_PER_PAGE_LIST.map((page, index) => {
            return (
              <li
                key={`${page}`}
                className={
                  listIndex == index ? styles.dropdown_menu_item_active : styles.dropdown_menu_item
                }
                onClick={() => handleItemSelected(index)}
              >
                {page}/page
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Label({ loading, currentPage, setCurrentPage, total }) {
  return (
    <>
      {total < 8 &&
        new Array(total).fill(0).map((item, index) => {
          return (
            <div
              key={index}
              className={
                styles.mida_label + " " + `${index + 1 === currentPage && styles.mida_label_active}`
              }
            >
              <Button disabled={loading} onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </Button>
            </div>
          );
        })}
      {total >= 8 && (
        <>
          {currentPage >= 5 && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(1)}>
                {1}
              </Button>
            </div>
          )}
          {currentPage >= 5 && (
            <div className={styles.mida_label}>
              <Button disabled={true}>{"..."}</Button>
            </div>
          )}
          {currentPage - 4 > 0 && [total].includes(currentPage) && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage - 4)}>
                {currentPage - 4}
              </Button>
            </div>
          )}
          {currentPage - 3 > 0 && [4, total - 1, total].includes(currentPage) && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage - 3)}>
                {currentPage - 3}
              </Button>
            </div>
          )}
          {currentPage - 2 > 0 && [3, 4, total - 2, total - 1, total].includes(currentPage) && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage - 2)}>
                {currentPage - 2}
              </Button>
            </div>
          )}
          {currentPage - 1 > 0 && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage - 1)}>
                {currentPage - 1}
              </Button>
            </div>
          )}
          <div className={styles.mida_label + " " + styles.mida_label_active}>
            <Button disabled={loading}>{currentPage}</Button>
          </div>
          {currentPage + 1 <= total && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage + 1)}>
                {currentPage + 1}
              </Button>
            </div>
          )}
          {currentPage + 2 <= total && [1, 2, 3, total - 3, total - 2].includes(currentPage) && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage + 2)}>
                {currentPage + 2}
              </Button>
            </div>
          )}
          {currentPage + 3 <= total && [1, 2, total - 3].includes(currentPage) && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage + 3)}>
                {currentPage + 3}
              </Button>
            </div>
          )}
          {currentPage + 4 <= total && [1].includes(currentPage) && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(currentPage + 4)}>
                {currentPage + 4}
              </Button>
            </div>
          )}
          {total - currentPage >= 4 && (
            <div className={styles.mida_label}>
              <Button disabled={true}>{"..."}</Button>
            </div>
          )}
          {total - currentPage >= 4 && (
            <div className={styles.mida_label}>
              <Button disabled={loading} onClick={() => setCurrentPage(total)}>
                {total}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function ListPagination({
  loading,
  currentPage,
  setCurrentPage,
  total,
  setSessionsPerPage,
}) {
  return (
    <InlineStack gap={300} align="center" blockAlign="center">
      <Pagination
        label={
          <Label
            loading={loading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={total}
          />
        }
        hasPrevious={currentPage > 1 && currentPage <= total}
        onPrevious={() => setCurrentPage(currentPage - 1)}
        hasNext={currentPage > 0 && currentPage < total}
        onNext={() => setCurrentPage(currentPage + 1)}
      />

      {window.location.pathname === "/replays" && (
        <SessionsPerPageList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setSessionsPerPage={setSessionsPerPage}
        />
      )}
    </InlineStack>
  );
}

export function CursorPagination({
  loading,
  currentPage,
  setCurrentPage,
  total,
  setSessionsPerPage,
}) {
  return (
    <InlineStack gap={300} align="center" blockAlign="center">
      {total > 1 && (
        <Pagination
          label={loading ? <Spinner size="small" /> : `${currentPage} of ${total}`}
          hasPrevious={currentPage > 1 && currentPage <= total}
          onPrevious={() => setCurrentPage(currentPage - 1)}
          hasNext={currentPage > 0 && currentPage < total}
          onNext={() => setCurrentPage(currentPage + 1)}
        />
      )}

      {window.location.pathname === "/replays" && (
        <SessionsPerPageList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setSessionsPerPage={setSessionsPerPage}
        />
      )}
    </InlineStack>
  );
}
