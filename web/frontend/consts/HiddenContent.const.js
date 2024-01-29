export const HIDDEN_CONTENT_SESSION = `
<div class="msr_hidden_content" style="display:flex;flex-direction:column;align-items:center;font-size:2rem;padding-top:150px;display:none">
  <div>
    <img src="https://${process.env.NEXT_PUBLIC_APP_URL}/images/hidden.png" alt="hidden-icon" width=200 />
  </div>
  <div style="margin:2rem;font-weight:500;">This content is private. Could not record Checkout pages!</div>
  <div>After 5 seconds will play the next page</div>
</div>
`;

export const HIDDEN_CONTENT_PAGEVIEW = `
<div class="msr_hidden_content" style="display:flex;flex-direction:column;align-items:center;font-size:2rem;padding-top:150px;display:none">
  <div>
    <img src="https://${process.env.NEXT_PUBLIC_APP_URL}/images/hidden.png" alt="hidden-icon" width=200 />
  </div>
  <div style="margin:2rem;font-weight:500;">This content is private. Could not record Checkout pages!</div>
</div>
`;
