
const API_BASE = "https://script.google.com/macros/s/AKfycbzK034VDCfzxBhEpKYirPjZO1PnDTKZ7VZ1SxVysIIK_2fkCt5gK790hY0Qr-cD-S50/exec";

/**
 * Gửi POST tới backend
 */
async function apiPost(path, data = {}) {
  const res = await fetch(
    `${API_BASE}?path=${path}&method=POST`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  );
  return await res.json();
}
