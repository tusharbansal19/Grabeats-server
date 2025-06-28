const fetch = require("node-fetch"); // or use global fetch in Node 18+

const urlsToPing = [
  
  "https://taskserver-v7qf.onrender.com",
  "https://t-task-management.onrender.com/",
  "https://automobiles-next.onrender.com/cars"

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