export async function deleteSession(ids, jwt) {
  const result = { ok: false, message: "Delete failed" };
  const query = Array.isArray(ids) ? ids.join(",") : ids;
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions/${query}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    const json = await response.json();
    if (json && json.statusCode === 204) {
      result.ok = true;
      result.message = "Delete successfully";
    }
  } catch (e) {
    console.log("[MSR] error_delete_session:", e);
  }
  return result;
}

export async function findSessions(query, jwt) {
  const result = { ok: false, data: null };
  try {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_sessions:", e);
  }
  return result;
}

export async function findPageUrl(query, jwt) {
  const result = { ok: false, data: null };
  try {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_page_url:", e);
  }
}

export const sessionApi = {
  saveTag: async ({ sessionID, jwt, sessionTags = [] }) => {
    let res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions/${sessionID}/tags`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          tags: sessionTags,
        }),
      },
    );
    return await res.json();
  },
};
