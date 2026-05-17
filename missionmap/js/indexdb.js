 // Ripped from https://progressier.com/pwa-capabilities/indexeddb-demo
 
 // --- Configuration ---
const DB_NAME = 'MissionMapDatabase';
const DB_VERSION = 1;
const SETTINGS_STORE_NAME = 'settings';
const KEY_NAME_1 = 'scenarioId';
const KEY_NAME_2 = 'useJsMap';
let db; // Will hold the database object

let scenario = 0;
let useJavaScriptMapAPI = false;


// --- IndexedDB Initialization ---
function initDB() {
  log("Opening database connection...");
            
  // Open (or create) the database
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  // Triggered if the client doesn't have this DB or version is higher
  request.onupgradeneeded = (event) => {
    log("Database upgrade needed. Creating object store...", 'success');
    db = event.target.result;
                
    // Create an object store named 'user_notes'
    // We don't need a keyPath because we will specify the key manually
    if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
      db.createObjectStore(SETTINGS_STORE_NAME);
    }
};

  request.onsuccess = (event) => {
    log("Database connected successfully.", 'success');
    db = event.target.result;
    loadData(); // Load data immediately after connection
  };

  request.onerror = (event) => {
    log(`Database error: ${event.target.error}`, 'error');
    };
}

// --- CRUD Operations ---
function saveSettings() {
  scenario = document.getElementById('scenario').value;
  useJavaScriptMapAPI = document.getElementById('mapMethod').value == true;
            
  if (!db) {
    log("Error: Database not initialized.", 'error');
    return;
  }

  // 1. Start a transaction (readwrite)
  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
            
  // 2. Get the object store
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
            
  // 3. Perform the Put operation (Insert or Update)
  const request = objectStore.put(noteContent, KEY_NAME_1);

  request.onsuccess = () => {
    log("Data successfully saved to IndexedDB!", 'success');
    alert("Saved! Now try reloading the page.");
  };

  request.onerror = (err) => {
    log(`Failed to save: ${err.target.error}`, 'error');
  };
}

function loadData() {
  if (!db) return;

  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
            
  // Get the specific key
  const request = objectStore.get(KEY_NAME);

  request.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
      //getInputEl().value = result;
      log(`Found saved data: "${result.substring(0, 20)}${result.length > 20 ? '...' : ''}"`, 'success');
    } else {
      log("No saved data found in IndexedDB.");
    }
  };
}

function clearData() {
  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
  const request = objectStore.clear();

  request.onsuccess = () => {
    getInputEl().value = '';
    log("Database cleared.", 'info');
  };
}

function getInputEl(){
  return document.getElementById('indexeddb-demo-input');
}

window.addEventListener("load", initDB);