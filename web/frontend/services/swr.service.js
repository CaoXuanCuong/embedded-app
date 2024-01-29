export const fetchData = async ([url, jwt]) => {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
  });

  return res.json();
};
