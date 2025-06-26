const fetch = require("node-fetch"); // or use global fetch in Node 18+

const urlsToPing = [
  "https://your-next-app.onrender.com/",
  "https://your-react-app.onrender.com/",
  "https://your-api-server.onrender.com/api/health",
  // Add more URLs as needed
];

// Ping all URLs every 14 minutes (under free Render sleep time)
setInterval(() => {
  const now = new Date().toISOString();
  console.log(`[${now}] Pinging URLs to prevent cold start...`);

  urlsToPing.forEach(async (url) => {
    try {
      const res = await fetch(url);
      console.log(`✅ Pinged: ${url} (status: ${res.status})`);
    } catch (err) {
      console.error(`❌ Failed to ping: ${url}`, err.message);
    }
  });
}, 14 * 60 * 1000); 