// Returns the connected creator's name, avatar, privacy options and limits.
module.exports = async (req, res) => {
  const token = req.cookies && req.cookies.tt_token;
  if (!token) {
    return res.status(401).json({ error: "Not connected" });
  }

  try {
    const r = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
    const data = await r.json();

    if (data.error && data.error.code !== "ok") {
      const status = data.error.code === "access_token_invalid" ? 401 : 400;
      return res.status(status).json({ error: data.error.message || data.error.code });
    }
    return res.status(200).json(data.data);
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
