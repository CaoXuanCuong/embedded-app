const defaultCss = `
#admin-bar-iframe {
    display: none !important;
}

.animate--slide-in {
    animation: var(--animation-slide-in);
}
`;

const domainStyles = {
  "e5a9fc-6.myshopify.com": `
  * {
    opacity: 1 !important;
  }

  product--wrapper.product-single__thumbnail[data-media-id="26352361373756"] {
    min-width: 400px;
    min-height: 400px;
  }
  .grid.grid-small.grid-spacer.product-single__media-group.product-single__media-group--single-xr.slick {
    display: none;
  }
  .product-single__thumbnails > .grid__item:first-child {
    min-width: 5 00px;
  }
  .product-single__thumbnails .grid__item:first-child {
    min-width: 400px;
  }
  .product-single__thumbnails .grid__item:nth-child(n+8) {
    display: none;
  }
  .product-single__thumbnails.grid grid-small.slick.slick-initialized.slick-slider {
    max-width: 430px;
  }
  .slick-track > .grid__item.one-fifth.product-thumbnail-wrapper.slick-slide {
    margin-bottom: 12px;
  }
  `,
  "valle-del-crati-store.myshopify.com": `
    body {
      opacity: 1 !important;
    }
  `,
};

export const generateSupportCssNode = (domain) => {
  const domainCss = domainStyles[domain] || "";
  const textContent = `${defaultCss}\n${domainCss}`;

  return templateNode(textContent);
};

const templateNode = (textContent) => {
  return {
    type: 2,
    tagName: "style",
    attributes: {
      author: "hoangnx1",
    },
    midaCustomizeNode: true,
    childNodes: [
      {
        type: 3,
        textContent,
        isStyle: true,
        id: 592001,
      },
    ],
    id: 592001,
  };
};
