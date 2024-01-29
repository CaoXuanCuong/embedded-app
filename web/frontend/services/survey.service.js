export async function createSurvey(data, jwt) {
  const result = { success: false, message: "Failed" };
  try {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (json) {
      result.success = json.success;
      result.message = json.message;
    }
  } catch (e) {
    console.log("[MSR] error_create_survey:", e);
  }
  return result;
}

export async function findSurvey(id, jwt) {
  const result = { ok: false, data: null };
  try {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const json = await response.json();
    if (json && json.statusCode === 200) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_survey:", e);
  }
  return result;
}

export async function findSurveys(query, jwt) {
  const result = { ok: false, data: null };
  try {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.data = json;
    }
  } catch (e) {
    console.log("[MSR] error_find_surveys:", e);
  }
  return result;
}

export async function deleteSurvey(id, jwt) {
  const result = { ok: false, message: "Delete failed" };
  try {
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });
    const json = await response.json();
    if (json && json.statusCode === 200) {
      result.ok = true;
      result.message = "Delete successfully";
    }
  } catch (e) {
    console.log("[MSR] error_delete_survey:", e);
  }
  return result;
}

export async function bulkEditStatus(allSurveyIds, status, jwt) {
  const result = { ok: false, message: "Update failed" };
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys/bulkUpdateStatus`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          allSurveyIds,
          status,
        }),
      },
    );
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.message = "Update successfully";
    }
  } catch (error) {
    console.log("[MSR] error_change_status:", error);
  }
  return result;
}

export async function bulkDelete(allSurveyIds, jwt) {
  const result = { ok: false, message: "Delete failed" };
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys/bulkDelete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          ids: allSurveyIds,
        }),
      },
    );
    const json = await response.json();
    if (json && (json.statusCode === 200 || json.statusCode === 404)) {
      result.ok = true;
      result.message = "Delete successfully";
    }
  } catch (error) {
    console.log("[MSR] error_change_status:", error);
  }
  return result;
}

export const surveyApi = {
  getAnalytic: async (jwt, id, type) => {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/analytics/surveys/${id}?type=${type}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );

    return await res.json();
  },
  getFeedback: async ({ jwt, id, page, limit, startDate, endDate }) => {
    const url = new URL(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/surveys/${id}/feedbacks`);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      startDate,
      endDate,
    });
    url.search = params.toString();

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });

    return await res.json();
  },
};
