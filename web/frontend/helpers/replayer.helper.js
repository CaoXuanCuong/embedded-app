import LocalStorageConst from "consts/LocalStorage.const";
import PlayerConst from "consts/Player.const";

export function handleNextTime(player, replayer, timeNext = 10) {
  let currentTime = Math.floor(replayer.getCurrentTime() / 1000);
  if (currentTime < 0) {
    currentTime = 0;
  }
  let { totalTime } = replayer.getMetaData();
  let ItotalTime = Math.floor(totalTime / 1000);
  if (ItotalTime - currentTime < timeNext) {
    player.goto(totalTime);
  } else {
    player.goto((currentTime + timeNext) * 1000);
  }
}

export function handlePreviousTime(player, replayer, timeForward = 10) {
  let currentTime = Math.floor(replayer.getCurrentTime() / 1000);
  if (currentTime > 10) {
    player.goto((currentTime - timeForward) * 1000);
  } else {
    player.goto(0);
  }
}

/**
 * Add buttons next, skip, backward, forward in Replayer
 */
export function renderButtonControlInPlayer({
  player,
  replayer,
  controlBar,
  sessions,
  id,
  router,
  path,
}) {
  let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
  let disableBackwardClick = currentSessionIndex === 0 || sessions.length === 1;
  let disableForwardClick = currentSessionIndex === sessions.length - 1 || sessions.length === 1;

  const previousButton = document.createElement("button");
  previousButton.classList.add("button-svg");
  previousButton.innerHTML = PlayerConst.previousButton;
  previousButton.addEventListener("click", function () {
    handlePreviousTime(player, replayer, 10);
  });
  controlBar.insertBefore(previousButton, controlBar.children[1]);

  const nextButton = document.createElement("button");
  nextButton.classList.add("button-svg");
  nextButton.innerHTML = PlayerConst.nextButton;
  nextButton.addEventListener("click", function () {
    handleNextTime(player, replayer, 10);
  });
  controlBar.insertBefore(nextButton, controlBar.children[2]);

  const backwardSessionButton = document.createElement("button");
  backwardSessionButton.classList.add("button-svg");
  backwardSessionButton.innerHTML = PlayerConst.backwardButton;

  if (!disableBackwardClick) {
    backwardSessionButton.addEventListener("click", function () {
      let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
      router.push(`/${path}/${sessions[currentSessionIndex - 1]._id}`);
    });
  } else {
    backwardSessionButton.classList.add("icon-disabled");
  }

  controlBar.insertBefore(backwardSessionButton, controlBar.children[3]);

  const forwardSessionButton = document.createElement("button");
  forwardSessionButton.classList.add("button-svg");
  forwardSessionButton.innerHTML = PlayerConst.forwardButton;

  if (!disableForwardClick) {
    forwardSessionButton.addEventListener("click", function () {
      let currentSessionIndex = sessions.findIndex((ele) => ele._id === id);
      router.push(`/${path}/${sessions[currentSessionIndex + 1]._id}`);
    });
  } else {
    forwardSessionButton.classList.add("icon-disabled");
  }
  controlBar.insertBefore(forwardSessionButton, controlBar.children[4]);

  // auto play
  let autoNextSession = JSON.parse(localStorage.getItem(LocalStorageConst.AUTO_NEXT)) || "";
  autoNextSession = autoNextSession ? autoNextSession : false;
  const autoplayWrapper = document.createElement("div");
  autoplayWrapper.innerHTML = `
  <div class="switch svelte-9brlez">
    <input type="checkbox" id="next" class="svelte-9brlez" ${
      autoNextSession && "checked"
    } onChange="autoNextChange(event)"/>
    <label for="next" class="svelte-9brlez"></label>
    <span class="label svelte-9brlez">autoplay</span>
  </div>
  `;
  const script = document.createElement("script");
  script.textContent = `
    function autoNextChange(e) {
      const {checked} = e.target;
      localStorage.setItem("${LocalStorageConst.AUTO_NEXT}", JSON.stringify(checked));
    }
  `;
  controlBar.insertBefore(autoplayWrapper, controlBar.children[10]);
  controlBar.insertBefore(script, controlBar.children[10]);
}

function setCSS(element, styles) {
  for (const property in styles) {
    if (Object.hasOwnProperty.call(styles, property)) {
      element.style[property] = styles[property];
    }
  }
}

export function renderSplitPageviewInPlayer(
  rrProgress,
  list,
  startTime,
  endTime,
  timesStartOfPageview,
) {
  const duration = parseInt(endTime) - parseInt(startTime);

  for (let i = 1; i < list.length; i++) {
    let left = ((timesStartOfPageview[i] - parseInt(startTime)) / duration) * 100;
    const splitEle = document.createElement("button");
    let styles = {
      width: " 2px",
      height: " 16px",
      position: " absolute",
      transform: " translate(-50%, -50%)",
      background: " rgb(250, 0, 0)",
      padding: "0",
      left: `${left}%`,
      top: "2px",
      cursor: "pointer",
    };
    setCSS(splitEle, styles);
    splitEle.classList.add("button-svg");
    rrProgress.insertBefore(splitEle, rrProgress.children[2]);
  }
}

export function renderOverlaySkipInactive() {
  try {
    const replayerWrapper = document.querySelector(".rr-player");
    if (replayerWrapper) {
      const replayerFrame = replayerWrapper.querySelector(".rr-player__frame");
      if (replayerFrame) {
        replayerFrame.style.position = "relative";
        const overlay = document.createElement("div");
        overlay.classList.add("rr-player__frame_overlay");
        let styles = {
          position: " absolute",
          top: " 0",
          width: " 100%",
          height: " 100%",
          background: " #000",
          opacity: " 0.3",
        };
        setCSS(overlay, styles);
        replayerFrame.appendChild(overlay);
      }
    }
  } catch (e) {
    console.log("renderOverlaySkipInactive error: ", e.message);
  }
}

export function clearOverlaySkipInactive() {
  const replayerWrapper = document.querySelector(".rr-player");
  if (replayerWrapper) {
    const overlay = replayerWrapper.querySelector(".rr-player__frame_overlay");
    if (overlay) {
      overlay.remove();
    }
  }
}

export function handleProgressClick(
  rrProgress,
  replayer,
  timesStartOfPageview,
  setIndex,
  indexRef,
) {
  if (rrProgress) {
    rrProgress.addEventListener("click", function () {
      clearOverlaySkipInactive();
      const currentTime = replayer.getCurrentTime();
      const metaData = replayer.getMetaData();
      if (currentTime >= 0 && timesStartOfPageview && timesStartOfPageview.length > 0) {
        const times = timesStartOfPageview.map((i) => i - timesStartOfPageview[0]);
        let currentIndex = -1;
        if (times[times.length - 1] <= currentTime && currentTime < metaData.totalTime) {
          currentIndex = times.length - 1;
        } else {
          for (let i = 0; i < times.length; i++) {
            if (times[i] >= currentTime) {
              currentIndex = i - 1;
              break;
            }
          }
        }
        if (currentIndex !== -1) {
          setIndex((prev) => {
            if (currentIndex !== prev) {
              indexRef.current = currentIndex;
              return currentIndex;
            } else {
              return prev;
            }
          });
        }
      }
    });
  }
}
