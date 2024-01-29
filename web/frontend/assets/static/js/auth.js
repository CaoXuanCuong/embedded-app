const errorMessageDOM = document.getElementById("error-message");
const urlInputDOM = document.getElementById("store-url");
const tooltipDOM = document.querySelector(".tooltip");
const tooltipIconDOM = document.querySelector(".input-tooltip-icon");
const bannerDOM = document.querySelector(".bss-b2b-login-form-banner");
const bannerCloseDOM = document.querySelector(".banner-close");

if (window.localStorage.getItem("mida-store-url")) {
  urlInputDOM.value = window.localStorage.getItem("mida-store-url");
  urlInputDOM.focus();
}

setPostionTooltip();

window.onresize = function () {
  setPostionTooltip();
};

function handleKeyPressEnter(e) {
  let key = e.keyCode || e.which;
  if (key == 13) {
    handleLogin();
  }
}

function handleLogin() {
  try {
    const host = window.location.hostname;
    const urlInput = urlInputDOM?.value ? urlInputDOM.value.trim() : "";
    if (!urlInput) {
      throw new Error("Store URL is required");
    }
    let storeId = urlInput;

    if (
      isURL(urlInput) &&
      (urlInput.includes("admin.shopify.com") || urlInput.includes("myshopify.com"))
    ) {
      storeId = getStoreIdFromURL(urlInput);
    }
    if (!isValidID(storeId)) {
      throw new Error("Store ID is invalid");
    }
    handleCloseErrorBanner();
    const authURL = `https://${host}/auth?shop=${storeId}.myshopify.com`;
    window.location = authURL;
  } catch (error) {
    displayErrorBanner();
  }
}

function getStoreIdFromURL(url) {
  try {
    const httpsURL = addHttpsPrefix(url);
    const parsedUrl = new URL(httpsURL);
    const { pathname, hostname } = parsedUrl;
    if (
      hostname.includes("admin.shopify.com") &&
      pathname.split("/")[1] === "store" &&
      hostname.split(".")[0] === "admin"
    ) {
      return pathname.split("/")[2];
    }
    if (hostname.includes(".myshopify.com") && hostname.split(".")[2] === "com") {
      return hostname.split(".")[0];
    }
    return url;
  } catch (err) {
    throw err;
  }
}

function displayErrorBanner() {
  bannerDOM.style.display = "flex";
}

function handleCloseErrorBanner() {
  bannerDOM.style.display = "none";
}

function setPostionTooltip() {
  const tooltipRect = tooltipDOM.getBoundingClientRect();
  const isOutScreen = tooltipRect.left + tooltipRect.width > window.innerWidth;
  if (isOutScreen) {
    tooltipDOM.style.left = "auto";
    tooltipDOM.style.right = "15px";
  }
}

function isValidID(string) {
  if (string.length < 2) return false;
  const regex = /^[a-zA-Z0-9-]+$/;
  return regex.test(string);
}

function isURL(string) {
  try {
    new URL(addHttpsPrefix(string));
    return true;
  } catch (_) {
    return false;
  }
}

function addHttpsPrefix(url) {
  if (!/^(f|ht)tps?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}
