// --- Logging all messages into a custom div ---
// Ripped from https://progressier.com/pwa-capabilities/indexeddb-demo
function log(message, type = 'info') {
  const logEl = document.getElementById("mission-map-log");
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = type === 'error' ? 'log-error' : (type === 'success' ? 'log-success' : 'log-info')
  entry.innerHTML = `<span>[${timestamp}]</span> ${message}`;
  console.log(`[${timestamp}] ${message}`);
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight; // Auto scroll to bottom
}