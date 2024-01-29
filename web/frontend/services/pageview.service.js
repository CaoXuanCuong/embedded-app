export async function deletePageview(ids, jwt) {
  const result = { ok: false, message: "Delete failed" };
  const query = Array.isArray(ids) ? ids.join(",") : ids;
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/${query}`,
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

export const pageviewApi = {
  saveTags: async ({ pageviewId, jwt, pageviewTags = [] }) => {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/${pageviewId}/tags`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          tags: pageviewTags,
        }),
      },
    );
    return await res.json();
  },
};
