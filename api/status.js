// Checks whether TikTok finished posting the video.
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies && req.cookies.tt_token;
  if (!token) {
    return res.status(401).json({ error: "Not connected" });
  }

  const publishId = req.body && req.body.publish_id;
  if (!publishId) {
    return res.status(400).json({ error: "Missing publish_id" });
  }

  try {
    const r = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const data = await r.json();

    if (data.error && data.error.code !== "ok") {
      return res.status(400).json({ error: data.error.message || data.error.code });
    }
    return res.status(200).json(data.data);
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
