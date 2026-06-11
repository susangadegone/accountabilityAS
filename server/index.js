require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in environment (.env)");
  process.exit(1);
}

app.post("/api/claude", async (req, res) => {
  const { prompt, max_tokens } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await anthropicRes.json();
    res.status(anthropicRes.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to reach Anthropic API" });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
