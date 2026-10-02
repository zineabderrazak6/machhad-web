// Sends a video the creator approved to TikTok (Direct Post).
// Only videos hosted in the site's /videos/ folder are allowed.
const ALLOWED_PREFIX = "https://machhad-web.vercel.app/videos/";
const PRIVACY = ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies && req.cookies.tt_token;
  if (!token) {
    return res.status(401).json({ error: "Not connected" });
  }

  const b = req.body || {};
  if (!b.video_url || !b.video_url.startsWith(ALLOWED_PREFIX)) {
    return res.status(400).json({ error: "Video not allowed" });
  }
  if (!PRIVACY.includes(b.privacy_level)) {
    return res.status(400).json({ error: "Choose who can view this video" });
  }

  const body = {
    post_info: {
      title: String(b.title || "").slice(0, 2200),
      privacy_level: b.privacy_level,
      disable_comment: !!b.disable_comment,
      disable_duet: !!b.disable_duet,
      disable_stitch: !!b.disable_stitch,
      brand_content_toggle: !!b.brand_content_toggle,
      brand_organic_toggle: !!b.brand_organic_toggle,
      is_aigc: true,
    },
    source_info: {
      source: "PULL_FROM_URL",
      video_url: b.video_url,
    },
  };

  try {
    const r = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();

    if (data.error && data.error.code !== "ok") {
      return res.status(400).json({ error: data.error.message || data.error.code });
    }
    return res.status(200).json({ publish_id: data.data.publish_id });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
