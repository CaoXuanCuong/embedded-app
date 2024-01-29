const PlayerConst = {
  previousButton: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
        d="M4.75 13.5h7.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H3.56l1.47 1.47a.75.75 0 0 1-1.06 1.06L1.22 4.28a.75.75 0 0 1-.017-1.043l.018-.02.05-.052a60.987 60.987 0 0 1 .842-.875A53.896 53.896 0 0 1 3.99.45.75.75 0 1 1 5.01 1.55 48.04 48.04 0 0 0 3.519 3h8.731A2.75 2.75 0 0 1 15 5.75v6.5A2.75 2.75 0 0 1 12.25 15h-7.5a.75.75 0 0 1 0-1.5Z"
    ></path>
    <path
        d="M6.736 7.06A.5.5 0 0 1 7 7.5V11h.5a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h1V8.434l-.723.482a.5.5 0 1 1-.554-.832l1.5-1a.5.5 0 0 1 .513-.025Z"
    ></path>
    <path
        d="M9.5 7a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-2Zm.5 4V8h1v3h-1Z"
        fill-rule="evenodd"
    ></path>
    </svg>`,

  nextButton: `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    class="css-1pa2hnj e1x29g350"
    aria-hidden="true"
    >
        <path
            d="M11.25 13.5h-7.5c-.69 0-1.25-.56-1.25-1.25v-6.5c0-.69.56-1.25 1.25-1.25h8.69l-1.47 1.47a.75.75 0 0 0 1.06 1.06l2.75-2.75a.75.75 0 0 0 .017-1.043l-.018-.02-.05-.052a60.747 60.747 0 0 0-.842-.875A53.94 53.94 0 0 0 12.01.45.75.75 0 1 0 10.99 1.55c.496.458 1.029.982 1.49 1.449H3.75A2.75 2.75 0 0 0 1 5.75v6.5A2.75 2.75 0 0 0 3.75 15h7.5a.75.75 0 0 0 0-1.5ZM5.736 7.06A.5.5 0 0 1 6 7.5V11h.5a.5.5 0 0 1 0 1H4a.5.5 0 0 1 0-1h1V8.434l-.723.482a.5.5 0 1 1-.554-.832l1.5-1a.5.5 0 0 1 .513-.025ZM8.5 7a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-2Zm.5 4V8h1v3H9Z"
            fill-rule="evenodd"
        ></path>
    </svg>
    `,

  backwardButton: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="
    width: 16px;
    height: 16px;
    ">
    <path style="
       width: 14px;
       height: 14px;
       " d="M257.4 64c-6.75 0-13.41 2.344-18.91 6.875L64 214.2V80C64 71.16 56.84 64 48 64S32 71.16 32 80v352C32 440.8 39.16 448 48 448S64 440.8 64 432V297.8l174.5 143.3C243.1 445.7 250.6 448 257.4 448C267.7 448 288 439.9 288 415.1V96.03C288 72.13 267.7 64 257.4 64zM256 416.4L64.52 256L256 95.59V416.4z"/>
    </svg>`,

  forwardButton: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="
    width: 16px;
    height: 16px;
    ">
    <path d="M272 64C263.2 64 256 71.16 256 80v134.2L81.53 70.88C76.03 66.34 69.38 64 62.63 64C52.28 64 32 72.13 32 96.03v319.9C32 439.9 52.28 448 62.63 448c6.75 0 13.41-2.344 18.91-6.875L256 297.8V432c0 8.844 7.156 16 16 16s16-7.156 16-16v-352C288 71.16 280.8 64 272 64zM64 416.4V95.59L255.5 256L64 416.4z" style="
       width: 14px;
       height: 14px;
       "></path>
  </svg>`,

  speedOptions: {
    1: 6,
    2: 7,
    4: 8,
    8: 9,
  },
};

export default PlayerConst;