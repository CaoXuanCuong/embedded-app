export const shopApi = {
  checkEmbed: async ({ jwt }) => {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_SERVER_URL}/shops/check-embed`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    });

    return await res.json();
  },
};
