 // Ripped from https://progressier.com/pwa-capabilities/indexeddb-demo
 
 // --- Configuration ---
const DB_NAME = 'MissionMapDatabase';
const DB_VERSION = 1;
const SETTINGS_STORE_NAME = 'settings';
const KEY_NAME_1 = 'scenarioId';
const KEY_NAME_2 = 'useJsMap';
const KEY_NAME_3 = 'darkMode';
const KEY_NAME_4 = 'wakeLock';
const KEY_NAME_5 = 'rotate';
const KEY_NAME_6 = 'follow';

let db; // Will hold the database object

let scenario = 0;
let useJavaScriptMapAPI = false;

let darkMode = false;
let wakeLock = false;
let rotate = true;
let follow = true;


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
    loadSettings(); // Load settings immediately after connection
  };

  request.onerror = (event) => {
    log(`Database error: ${event.target.error}`, 'error');
    };
}

// --- CRUD Operations ---
function saveSettings() {
  useJavaScriptMapAPI = document.getElementById('mapMethod').value == true;
            
  if (!db) {
    log("Error: Database not initialized.", 'error');
    return;
  }
  scenario = document.getElementById('scenario').value;
  saveValue(KEY_NAME_1, scenario);
  useJavaScriptMapAPI = document.getElementById('mapMethod').value;
  saveValue(KEY_NAME_2, useJavaScriptMapAPI);
}

function saveValue(key, value)
{
  // 1. Start a transaction (readwrite)
  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
            
  // 2. Get the object store
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
            
  // 3. Perform the Put operation (Insert or Update)
  const request = objectStore.put(value, key);

  request.onsuccess = () => {
    log(`Saved ${key}:${value}`, 'success');
  };

  request.onerror = (err) => {
    log(`Failed to save ${key}:${value} ${err.target.error}`, 'error');
  };
}

function changeDarkMode() {
	darkmode = document.getElementById('darkmode').value;
	saveValue(KEY_NAME_3, darkmode);
}
function changeWakeLock() {
	wakelock = document.getElementById('rotate').value;
	saveValue(KEY_NAME_4, wakelock);
}
function changeRotate() {
	rotate = document.getElementById('rotate').value;
	saveValue(KEY_NAME_5, rotate);
}
function changeFollow() {
	follow = document.getElementById('follow').value;
	saveValue(KEY_NAME_6, follow);
}

function loadSettings() {
  if (!db) return;

  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
            
  // Get the specific key
  const request = objectStore.get(KEY_NAME_1);

  request.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  scenario = result;
      log(`Found saved data: "${KEY_NAME_1} ${result.substring(0, 20)}${result.length > 20 ? '...' : ''}"`, 'success');
    } else {
      log("No saved data found in IndexedDB.");
    }
  };
}
/*
function clearData() {
  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
  const request = objectStore.clear();

  request.onsuccess = () => {
    getInputEl().value = '';
    log("Database cleared.", 'info');
  };
}
*/
window.addEventListener("load", initDB);