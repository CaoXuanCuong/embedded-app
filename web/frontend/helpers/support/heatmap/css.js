const domainStyles = {
  "valle-del-crati-store.myshopify.com": `
    body {
        opacity: 1 !important;
    }
  `,
};

export const generateSupportCss = ({ domain, iframeDocument }) => {
  const domainCss = domainStyles[domain] || "";
  if (domainCss && iframeDocument) {
    const styleTag = document.createElement("style");
    styleTag.textContent = domainCss;
    const headTag = iframeDocument.querySelector("head");
    headTag.appendChild(styleTag);
  }
};
