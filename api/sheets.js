module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.APP_PASSWORD || req.headers["x-app-password"] !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sheetsUrl = process.env.SHEETS_URL;
  if (!sheetsUrl) return res.status(500).json({ error: "Sheets URL not configured" });

  const data = req.query.data;
  if (!data) return res.status(400).json({ error: "Missing data" });

  try {
    const sheetRes = await fetch(`${sheetsUrl}?data=${encodeURIComponent(data)}`);
    const text = await sheetRes.text();
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: "Failed to reach Sheets" });
  }
};
