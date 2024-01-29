import { HEATMAP_DEVICE } from "consts/Heatmap.const";
import * as h337 from "heatmap.js";

export function pageType(pathName) {
  if (pathName == "/") {
    return 0;
  } else if (pathName.includes("collections")) {
    return 1;
  } else if (pathName.includes("products")) {
    return 2;
  } else if (pathName == "/cart") {
    return 3;
  } else if (pathName.includes("checkouts")) {
    return 4;
  } else if (pathName == "/account/login") {
    return 5;
  } else if (pathName == "/search") {
    return 6;
  } else if (pathName.includes("/contact")) {
    return 7;
  } else {
    return 8;
  }
}

export function percentageToColor(percentage, maxHue = 220, minHue = 0) {
  const hue = (1 - percentage) * (maxHue - minHue) + minHue;
  const lightness = (1 / percentage) * 50;
  return `hsla(${hue}, 90%, 60%, 0.75)`;
}

export function resizeContainer({ pageContent, iframeContainer, height, width, heatmapDevice }) {
  if (heatmapDevice === HEATMAP_DEVICE.MOBILE || heatmapDevice === HEATMAP_DEVICE.TABLET) {
    return;
  }
  let aspectRatio = height / width;
  let containerHeight = pageContent.offsetWidth * aspectRatio;
  pageContent.style.height = containerHeight + "px";

  let scaleX = pageContent.offsetWidth / width;
  let scaleY = pageContent.offsetHeight / height;
  iframeContainer.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
}

export function displayHeatmap(iframeDocument, container, elementLayer, heatmapData, heatmapType) {
  let heatmapInstance = h337.create({
    container: container,
    gradient: { 0.1: "#ab4bde", 0.4: "#1e91ed", 0.7: "#f7ee92", 0.95: "#ff5830" },
    blur: 0.9,
    radius: heatmapType == "click" ? 10 : 12,
  });

  let msrElementWrapper = elementLayer.querySelector("#msr_element_wrapper");
  let elementOccurrences = new Map();
  let coordinateMap = new Map();
  let totalCoordinates = 0;
  let coordinateData = [];

  const allElements = iframeDocument.querySelectorAll("*");
  const hiddenElements = Array.from(allElements).filter((element) => {
    const computedStyles = window.getComputedStyle(element);
    const opacity = computedStyles.getPropertyValue("opacity");
    const visibility = computedStyles.getPropertyValue("visibility");
    return opacity == 0 || visibility == "hidden";
  });

  for (const data of heatmapData) {
    let element = Array.from(iframeDocument.querySelectorAll(data.query)).find(
      (el) => el.textContent === data.textContent,
    );
    if (element) {
      let coordinate = {};
      const elementRect = element.getBoundingClientRect();
      if (checkHiddenElement(element, hiddenElements)) continue;
      if (data.x < elementRect.left) {
        coordinate.x = Math.ceil(elementRect.left + (Math.random() * elementRect.width) / 2);
      } else if (data.x > elementRect.right) {
        coordinate.x = Math.floor(elementRect.right - (Math.random() * elementRect.width) / 2);
      } else {
        coordinate.x = Math.round(data.x);
      }

      if (data.y < elementRect.top) {
        coordinate.y = Math.ceil(elementRect.top + (Math.random() * elementRect.height) / 2);
      } else if (data.y > elementRect.bottom) {
        coordinate.y = Math.floor(elementRect.bottom - (Math.random() * elementRect.height) / 2);
      } else {
        coordinate.y = Math.round(data.y);
      }
      coordinate = JSON.stringify(coordinate);
      let intensity = coordinateMap.get(coordinate)
        ? coordinateMap.get(coordinate) + data.counts
        : data.counts;
      coordinateMap.set(coordinate, intensity);
      let occurrences = elementOccurrences.get(element)
        ? elementOccurrences.get(element) + data.counts
        : data.counts;
      elementOccurrences.set(element, occurrences);
      totalCoordinates += data.counts;
    }
  }

  const maxValue = Math.max(...coordinateMap.values());
  coordinateMap.forEach((value, key, map) => {
    let coordinate = JSON.parse(key);
    coordinate.value = value;
    coordinateData.push(coordinate);
  });

  elementOccurrences = new Map([...elementOccurrences.entries()].sort((a, b) => b[1] - a[1]));
  let rank = 0;
  for (const [key, value] of elementOccurrences) {
    rank += 1;
    let elementRect = key.getBoundingClientRect();
    let msrElement = document.createElement("div");
    msrElement.setAttribute("class", "msr_overlay_element msr_element_bounding_box");
    msrElement.setAttribute(
      "style",
      `top: ${elementRect.top}px; left: ${elementRect.left}px; width: ${elementRect.width}px; height: ${elementRect.height}px; z-index: 9999999999; position: absolute;`,
    );
    let msrElementDetailed = document.createElement("span");
    let elementCountStyle = "msr_element_count msr_element_detailed";
    if (elementRect.top < 12) {
      elementCountStyle += " bottom_right_placement";
    } else {
      elementCountStyle += " top_right_placement";
    }
    msrElementDetailed.setAttribute("class", elementCountStyle);

    let msrElementRank = document.createElement("span");
    msrElementRank.setAttribute("class", "msr_element_rank");
    msrElementRank.textContent = `#${rank}`;

    let msrElementRate = document.createElement("span");
    msrElementRate.setAttribute("class", "msr_element_rate");
    let numberOfClicks =
      heatmapType === "click" ? value + (value > 1 ? " clicks: " : " click: ") : "";
    msrElementRate.textContent = `${
      numberOfClicks + ((value / totalCoordinates) * 100).toFixed(2)
    }%`;
    msrElementWrapper.appendChild(msrElement);
    msrElement.appendChild(msrElementDetailed);
    msrElementDetailed.appendChild(msrElementRank);
    msrElementDetailed.appendChild(msrElementRate);
    let parentElement;
    key.onmouseenter = () => {
      (function (msrElement) {
        const e = iframeDocument.querySelector(".msr_overlay_element.msr_element_hover");
        if (e) {
          parentElement = e;
          e.classList.remove("msr_element_hover");
        }
        msrElement.classList.add("msr_element_hover");
      })(msrElement);
    };

    key.onmouseleave = () => {
      (function (msrElement) {
        msrElement.classList.remove("msr_element_hover");
        if (parentElement) parentElement.classList.add("msr_element_hover");
      })(msrElement);
    };
  }

  heatmapInstance.setData({
    max: maxValue,
    data: coordinateData,
  });
}

export function displayScrollmap(container, heatmapData) {
  const msrScrollmapBins = container.querySelector("#msr_scrollmap_bins");
  const msrScrollmapHoverLine = container.querySelector("#msr_scrollmap_hover_line");
  const msrScrollmapHoverLabel = msrScrollmapHoverLine.querySelector(".msr_scrollmap_hover_label");
  msrScrollmapHoverLine.style.display = "";

  const numberOfBins = 20;
  const binHeight = container.scrollHeight / numberOfBins;
  let gradientColor = "linear-gradient(";

  for (let i = 0; i < numberOfBins; i++) {
    let bin = document.createElement("div");

    bin.setAttribute("class", `msr_scrollmap_bin bin_${i}`);
    bin.setAttribute(
      "style",
      `background: "transparent";
       height: ${binHeight}px;`,
    );
    bin.onmousemove = (e) => {
      msrScrollmapHoverLine.style.transform = `translateY(${e.pageY - 20}px)`;
      msrScrollmapHoverLabel.style.transform = `translateX(${e.pageX}px)`;
      msrScrollmapHoverLabel.textContent = `${
        i < heatmapData.length ? Math.round(heatmapData[i] * 100) : 0
      }% users reached this point`;
    };

    if (i !== numberOfBins - 1) {
      gradientColor += `${percentageToColor(heatmapData[i])} ${binHeight + binHeight * i}px,`;
    } else {
      gradientColor += `${percentageToColor(heatmapData[i])} ${binHeight + binHeight * i}px)`;
    }

    msrScrollmapBins.appendChild(bin);
  }

  container.style.background = gradientColor;
}
function checkHiddenElement(element, hiddenElements) {
  const elementRect = element.getBoundingClientRect();
  if (elementRect.width == 0 || elementRect.height == 0) return true;
  for (let i = 0; i < hiddenElements.length; i++) {
    if (hiddenElements[i].contains(element)) {
      return true;
    }
  }
  return false;
}

export function clearHeatmapBuilt(iframe) {
  try {
    const iframeDocument = iframe.contentDocument.documentElement;
    const msrHmContent = iframeDocument.querySelector("#msr_hm_content");
    const msrScrollmapBins = iframeDocument.querySelector("#msr_scrollmap_bins");
    const msrScrollmapHoverLine = iframeDocument.querySelector("#msr_scrollmap_hover_line");
    const msrElementWrapper = iframeDocument.querySelector("#msr_element_wrapper");
    const h337 = iframeDocument.querySelector(".heatmap-canvas");
    msrHmContent ? (msrHmContent.textContent = "") : "";
    msrScrollmapBins ? (msrScrollmapBins.textContent = "") : "";
    msrElementWrapper ? (msrElementWrapper.textContent = "") : "";
    msrScrollmapHoverLine ? (msrScrollmapHoverLine.style.display = "none") : "";
    h337 && h337.remove();
    iframe.contentWindow.scrollTo(0, 0);
    iframe.removeEventListener("scroll", scroll);
  } catch (error) {
    console.log(`[clearHeatmapBuilt]::`, error);
  }
}

export const renderBackgroundOverlay = ({ iframe }) => {
  iframe.contentWindow.scrollTo(0, 0);

  const msrHmOverlay = buildMsrHmOverlay(iframe);
  const msrScrollmap = buildMsrScrollMap(iframe);
  const msrElementOverLay = buildMsrElementOverlay(iframe);
  iframe.contentDocument.documentElement.appendChild(msrHmOverlay);
  iframe.contentDocument.documentElement.appendChild(msrScrollmap);
  iframe.contentDocument.documentElement.appendChild(msrElementOverLay);
};

function buildMsrHmOverlay(iframe) {
  const msrHmOverlay = document.createElement("div");
  msrHmOverlay.setAttribute("id", "msr_hm_overlay");
  msrHmOverlay.setAttribute(
    "style",
    `width: ${iframe.contentDocument.documentElement.offsetWidth}px; height: ${iframe.contentDocument.documentElement.scrollHeight}px;`,
  );

  const msrHmOverlayStyle = document.createElement("style");
  msrHmOverlayStyle.setAttribute("type", "text/css");
  msrHmOverlayStyle.textContent = `
          #msr_hm_overlay {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            position: absolute;
            z-index: 999999997;
            cursor: pointer;
            pointer-events: none;
          }
  
          #msr_hm_overlay .heatmap-canvas {
            width: unset;
            height: unset;
          }
        `;

  const msrHmWrapper = document.createElement("div");
  msrHmWrapper.setAttribute("id", "msr_hm_wrapper");
  msrHmWrapper.setAttribute(
    "style",
    `width: ${iframe.contentDocument.documentElement.offsetWidth}px; height: ${iframe.contentDocument.documentElement.scrollHeight}px;`,
  );

  const msrHmWrapperStyle = document.createElement("style");
  msrHmWrapperStyle.setAttribute("type", "text/css");
  msrHmWrapperStyle.textContent = `
          #msr_hm_wrapper {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            position: absolute;
            pointer-events: none;
            z-index: 999999998;
          }
        `;

  const msrHmContent = document.createElement("div");

  msrHmContent.setAttribute("id", "msr_hm_content");
  msrHmContent.setAttribute(
    "style",
    `position: relative; width: ${iframe.contentDocument.documentElement.offsetWidth}px; height: ${iframe.contentDocument.documentElement.scrollHeight}px`,
  );
  msrHmOverlay.appendChild(msrHmWrapper);
  msrHmOverlay.appendChild(msrHmOverlayStyle);
  msrHmWrapper.appendChild(msrHmContent);
  msrHmWrapper.appendChild(msrHmWrapperStyle);

  return msrHmOverlay;
}

function buildMsrScrollMap(iframe) {
  const msrScrollmap = document.createElement("div");
  msrScrollmap.setAttribute("id", "msr_scrollmap");
  msrScrollmap.setAttribute(
    "style",
    `width: ${iframe.contentDocument.documentElement.offsetWidth}px; height: ${iframe.contentDocument.documentElement.scrollHeight}px; display: none`,
  );

  const msrScrollmapStyle = document.createElement("style");
  msrScrollmapStyle.setAttribute("type", "text/css");
  msrScrollmapStyle.textContent = `
          #msr_scrollmap {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            position: absolute;
            z-index: 999999998;
            overflow: hidden;
            cursor: pointer;
          }
          
          #msr_scrollmap_bins {
            width: 100%;
          }
  
          #msr_scrollmap_bins .msr_scrollmap_bin {
            position: relative;
            width: 100%;
            z-index: 1;
            display: block;
            border: none;
            margin: 0;
          }
          
          #msr_scrollmap_hover_line {
            left: 0;
            line-height: 1;
            opacity: 0;
            position: absolute;
            right: 0;
            text-align: left;
            z-index: 3;       
          }
          
          #msr_scrollmap_hover_line .msr_scrollmap_hover_label {
            background: rgba(0, 0, 0, 0.5);
            border-radius: 3px 3px 0 0;
            color: #fff;
            display: inline-block;
            font-family: 'Helvetica Neue', 'Arial', sans-serif;
            font-size: 12px;
            font-weight: bold;
            line-height: 1;
            padding: 6px 7px 4px;
            position: relative;
          }
          
          #msr_scrollmap:hover #msr_scrollmap_hover_line {
            opacity: 1;       
          }
        `;

  const msrScrollmapHoverLine = document.createElement("div");
  msrScrollmapHoverLine.setAttribute("id", "msr_scrollmap_hover_line");
  msrScrollmapHoverLine.setAttribute("style", "display: none");

  const msrScrollmapHoverLabel = document.createElement("div");
  msrScrollmapHoverLabel.setAttribute("class", "msr_scrollmap_hover_label");

  const msrScrollmapBins = document.createElement("div");
  msrScrollmapBins.setAttribute("id", "msr_scrollmap_bins");

  msrScrollmap.appendChild(msrScrollmapHoverLine);
  msrScrollmap.appendChild(msrScrollmapBins);
  msrScrollmap.appendChild(msrScrollmapStyle);
  msrScrollmapHoverLine.appendChild(msrScrollmapHoverLabel);

  return msrScrollmap;
}

function buildMsrElementOverlay(iframe) {
  const msrElementOverLay = document.createElement("div");
  msrElementOverLay.setAttribute("id", "msr_element_overlay");
  msrElementOverLay.setAttribute(
    "style",
    `width: ${iframe.contentDocument.documentElement.offsetWidth}px; height: ${iframe.contentDocument.documentElement.scrollHeight}px`,
  );

  const msrElementWrapper = document.createElement("div");
  msrElementWrapper.setAttribute("id", "msr_element_wrapper");

  const msrElementOverLayStyle = document.createElement("style");
  msrElementOverLayStyle.setAttribute("type", "text/css");
  msrElementOverLayStyle.textContent = `
          #msr_element_overlay {
            background-color: transparent;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            position: absolute;
            z-index: 999999999;
            pointer-events: none;
            display: block;
            opacity: 1;
          }
          
          .msr_overlay_element {
            opacity: 0;
            transition-property: opacity;
            transition: .2s ease;
          }
          
          .msr_overlay_element.msr_element_hover {
            opacity: 1;
          }
          
          .msr_element_bounding_box {
            background-color: transparent;
            border: 1px dashed #2196F3;
            bottom: 0;
            cursor: pointer;
            transition-property: background-color;
            transition: .2s ease-in-out;
          }
         
          .msr_element_bounding_box.msr_element_hover {
            background-color: rgba(52, 152, 219, 0.5);
          }
          
          .msr_element_count {
            background-color: #2196F3;
            box-sizing: border-box;
            color: #FFF;
            font-family: 'Helvetica Neue', 'Arial', sans-serif;
            font-weight: bold;
            font-size: 13px;
            line-height: 1;
            min-width: 10px;
            position: absolute;
            transition: .2s transform ease;
            white-space: nowrap;
          }
          
          .msr_element_count span {
            display: block;
            line-height: 11px;
            padding: 4px;
          }
          
          #msr_element_overlay .msr_element_count {
            display: flex;
            pointer-events: none;
          }
        
          #msr_element_overlay .msr_element_detailed {
            padding: 0;
          }
          
          .msr_element_rank {
            background-color: rgba(0,0,0,.25);
            font-weight: 700;
          }
          
          .top_right_placement{
            right:0;
            transform: translate3d(0, -100%, 0);
          }

          .bottom_right_placement{
            right:0;
            bottom:0;
            transform: translate3d(0, 100%, 0);
          } 
        `;

  msrElementOverLay.appendChild(msrElementWrapper);
  msrElementOverLay.appendChild(msrElementOverLayStyle);

  return msrElementOverLay;
}
