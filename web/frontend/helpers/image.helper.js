import { DesktopMajor, MobileMajor, UnknownDeviceMajor, TabletMajor } from "@shopify/polaris-icons";
import { getCountryName } from "./country.helper";

const BROWSERS = ["Opera", "Firefox", "Safari", "IE", "Edge", "Chrome", "Edge Chromium", "Unknown"];

export function getCountryImage({ src }) {
  let countryName = getCountryName(src);
  if (countryName === "REST") {
    src = "rest";
  }
  return `/images/flags/${src.toLowerCase()}.svg`;
}

export function getOSImage({ src }) {
  let srcPath = "unknownOS";
  switch (src) {
    case "Mac OS":
      srcPath = "macOS";
      break;
    case "iOS":
      srcPath = "iOS";
      break;
    case "Windows":
      srcPath = "windowsOS";
      break;
    case "Android":
      srcPath = "androidOS";
      break;
    case "Linux":
      srcPath = "linuxOS";
      break;
    default:
      break;
  }
  return `/images/os/${srcPath}.svg`;
}

export function getBrowserImage({ src }) {
  let srcPath = "unknown";
  if (BROWSERS.indexOf(src) !== -1) {
    srcPath = src.toLowerCase().replace(/ /, "-");
  }
  return `/images/browsers/${srcPath}.svg`;
}

export function getDeviceTypeImage(type) {
  let result = UnknownDeviceMajor;
  if (type === "Desktop") {
    result = DesktopMajor;
  } else if (type === "Mobile") {
    result = MobileMajor;
  } else if (type === "Tablet") {
    result = TabletMajor;
  }
  return result;
}

export function getSurveyOptionImage({ src }) {
  return `/images/surveys/${src.toLowerCase()}.svg`;
}
