// Exchanges the "code" from TikTok for an access token.
// The Client secret stays on the server (Vercel environment variable).
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = req.body && req.body.code;
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    client_secret: process.env.TIKTOK_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: process.env.TIKTOK_REDIRECT_URI || "https://machhad-web.vercel.app/callback",
  });

  try {
    const r = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: params,
    });
    const data = await r.json();
       
    if (!data.access_token) {
      return res.status(400).json({
        error: data.error_description || data.error || "Could not connect to TikTok",
      });
    }

    // Keep the token in a secure cookie that page scripts cannot read
    const maxAge = data.expires_in || 86400;
    res.setHeader(
      "Set-Cookie",
      `tt_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
    );
    return res.status(200).json({ ok: true, scope: data.scope });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
