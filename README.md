# Daily Accountability Tracker

A local React app for me and my husband. We can plan our individual day, check in on each others week goals, and most importantly hold each other accountable! 
Built for personal use. No backend, no hosting, no accounts. The app isn't fancy but we find that it works. I connected a Google Sheets to it so my plan and check-in are remembered. Runs on your computer.

---

## What it does

**Plan** — Each day, set your top 5 tasks, a rough schedule, and one intention for the day.

**Check in** — That night or next morning, mark each task Done / Partial / Skipped, add what happened, and get a direct read from Claude on how the day went.

**Goals** — Set big life goals and project goals with target dates. These inform your daily check-ins and weekly reflections.

**Weekly** — Once a week, answer three questions about what moved, what stalled, and what you're committing to next week. If both people submit, Claude reads them together and gives a joint reflection.

**Meeting prep** — Before your 45-min or 30-min weekly meetings, fill in what you want to cover, where you're stuck, and what you need from the other person. Claude builds you an agenda.

**Google Sheets logging** — Every check-in, weekly reflection, and meeting prep automatically logs to a shared Google Sheet so both people can see the full history.

---

## Setup

### Requirements

- [Node.js](https://nodejs.org) (LTS version)
- An [Anthropic API key](https://console.anthropic.com)
- A Google account (for Sheets logging)

### Install

```bash
npx create-react-app daily-accountability
cd daily-accountability
```

Replace `src/App.js` with the app code, then open it and update these two lines at the top:

```javascript
const SHEETS_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL";
const ANTHROPIC_API_KEY = "YOUR_API_KEY_HERE";
```

Then open `package.json` and add the proxy before the last closing `}`:

```json
"proxy": "https://api.anthropic.com"
```

### Run

```bash
npm start
```

Opens at `http://localhost:3000`.

---

## Google Sheets setup

1. Create a new Google Sheet and share it with both users
2. In the Sheet, go to **Extensions → Apps Script**
3. Delete the default code and paste in the contents of `accountability-sheets.gs`
4. Click **Deploy → New deployment**
5. Choose **Web app**, set "Execute as" to **Me**, set "Who has access" to **Anyone**
6. Copy the `/exec` URL and paste it into `SHEETS_URL` in `src/App.js`

The script creates three tabs automatically on first use: **Check-ins**, **Weekly**, and **Meeting Prep**.

---

## Users

The app is set up for two people. You pick who you are when you open the app. Data is stored separately in `localStorage` by user.

To change the names, update this line in `src/App.js`:

```javascript
const USERS = ["Suz", "Aki"];
```

---

## Data

- Plans, goals, and check-ins are stored in `localStorage` — they persist across sessions
- Everything submitted (check-ins, weeklies, meeting prep) logs to the shared Google Sheet
- To delete entries, just remove rows directly in the Sheet



## Files

| File | What it is |
|------|-----------|
| `src/App.js` | The full React app |
| `accountability-sheets.gs` | Google Apps Script for Sheets logging |

---

## Notes

- This is a local dev tool, not a hosted app. Both people run it on their own computers.
- The Anthropic API key is in the client code — fine for personal local use, not for sharing publicly.
- Weekly cross-person reflection works by reading both users' `localStorage` on the same machine, or by submitting to the Sheet and reading from there in a future version.
