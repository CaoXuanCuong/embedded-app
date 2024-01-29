export async function findResponses(query, jwt) {
  const result = { ok: false, data: null };
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveyResponses${query}`,
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
    console.log("[MSR] error_find_responses:", e);
  }
  return result;
}
