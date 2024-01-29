import { isFulfilled } from "@reduxjs/toolkit";

export async function findPage(id, jwt, domain, device = "Desktop") {
  const result = { ok: false, data: null };
  let endpoint = "";
  let query = "";
  try {
    if (jwt) {
      endpoint = "pages";
      query += `device=${device}`;
    } else {
      endpoint = `shared/pages`;
      query += `domain=${domain}`;
    }
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/${endpoint}/${id}?${query}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_page:", e);
  }
  return result;
}

export async function findPages(jwt, domain) {
  const result = { ok: false, data: null };
  let endpoint = "";
  let query = "";

  try {
    if (jwt) {
      endpoint = "pages";
    } else {
      endpoint = `shared/pages`;
      query += `domain=${domain}`;
    }
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/${endpoint}?${query}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_pages:", e);
  }
  return result;
}

export async function findHeatmap({
  id,
  jwt,
  type,
  pageView,
  domain,
  device = "Desktop",
  width,
  height,
  controller,
  startDate,
  endDate,
  dT,
}) {
  const newController = new AbortController();
  controller.current = newController;
  const result = { ok: false, data: null };
  let endpoint = "";
  let query = "";
  try {
    if (jwt) {
      endpoint = "pages/heatmap";
    } else {
      endpoint = `shared/heatmap`;
      query = `domain=${domain}`;
    }
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/${endpoint}?${query}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          id,
          pageView,
          width,
          height,
          device,
          startDate,
          endDate,
          type,
          dT,
        }),
        signal: newController.signal,
      },
    );
    const json = await response.json();
    if (json && json.statusCode) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_heatmap:", e);
  }
  return result;
}

export async function searchPage(jwt, query) {
  const result = { ok: false, data: null };

  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pages/search?url=${query}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_search_page:", e);
  }
  return result;
}
