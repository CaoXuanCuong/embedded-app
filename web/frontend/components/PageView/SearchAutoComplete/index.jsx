import { Autocomplete, Button, Icon } from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import LocalStorageConst from "consts/LocalStorage.const";
import { useState, useCallback, useMemo, useEffect } from "react";

import styles from "./component.module.css";
export default function SearchAutoComplete({ hrefs, setSearch, onSearch, searchquery }) {
  const deselectedOptions = useMemo(() => {
    return hrefs.map((item) => {
      return {
        label: item,
        value: item,
      };
    });
  }, [hrefs]);
  const [selectedOptions, setSelectedOptions] = useState("");
  const [inputValue, setInputValue] = useState(function () {
    const urlStorage = JSON.parse(localStorage.getItem(LocalStorageConst.PAGE_VIEW)) || "";
    if (searchquery && searchquery.search && searchquery.search != "") {
      return searchquery.search;
    } else if (urlStorage) {
      return urlStorage;
    } else {
      return "";
    }
  });
  const [options, setOptions] = useState(deselectedOptions);

  const updateText = useCallback(
    (value) => {
      setInputValue(value);
      if (value === "") {
        setSearch("");
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = deselectedOptions.filter((option) => option.label.match(filterRegex));
      setOptions(resultOptions);
    },
    [deselectedOptions, setSearch],
  );

  const updateSelection = useCallback(
    (selected) => {
      const selectedValue = selected.map((selectedItem) => {
        const matchedOption = options.find((option) => {
          return option.value.match(selectedItem);
        });
        return matchedOption && matchedOption.label;
      });
      setSelectedOptions(selected);
      setSearch(selected[0]);
      setInputValue(selectedValue[0] || "");
    },
    [options, setSearch],
  );

  useEffect(() => {
    if (selectedOptions[0] && selectedOptions.length > 0) {
      localStorage.setItem(LocalStorageConst.PAGE_VIEW, JSON.stringify(selectedOptions[0]));
    }
  }, [selectedOptions]);

  const handleSearchClick = useCallback(() => {
    if (onSearch) {
      onSearch();
    }
  }, [onSearch]);

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      value={inputValue}
      prefix={<Icon source={SearchMinor} tone="base" />}
      placeholder="Search"
    />
  );

  return (
    <>
      <h2 className={styles.title}>Page to views</h2>
      <div className={styles.search}>
        <div className={styles.search_text}>Only 1 page is selected at a time</div>
        <div className={styles.search_box}>
          <Autocomplete
            options={options}
            selected={selectedOptions}
            onSelect={updateSelection}
            textField={textField}
          />
        </div>
      </div>
    </>
  );
}
