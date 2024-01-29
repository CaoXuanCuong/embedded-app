export const analyticApi = {
  getTopPages: async ({ jwt, startDate, endDate, limit }) => {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/pageviews/rank?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );
    return await res.json();
  },
  getVisitors: async ({ jwt, startDate, endDate }) => {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/visitors/aggregate?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );

    return await res.json();
  },
  getSessions: async ({ jwt, startDate, endDate }) => {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/sessions/aggregate?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );

    return await res.json();
  },
  orderFunnel: async ({ jwt, startDate, endDate }) => {
    const res = await fetch(
      `https://${process.env.NEXT_PUBLIC_SERVER_URL}/analytics/order-funnel?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      },
    );

    return await res.json();
  },
};
