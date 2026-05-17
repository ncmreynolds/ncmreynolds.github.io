 // Ripped from https://progressier.com/pwa-capabilities/indexeddb-demo
 
 // --- Configuration ---
const DB_NAME = 'MissionMapDatabase';
const DB_VERSION = 1;
const SETTINGS_STORE_NAME = 'settings';
const KEY_NAME_1 = 'scenarioId';
const KEY_NAME_2 = 'mapMode';
const KEY_NAME_3 = 'darkMode';
const KEY_NAME_4 = 'wakeLock';
const KEY_NAME_5 = 'rotate';
const KEY_NAME_6 = 'follow';

let db; // Will hold the database object

let scenario = 0;
let mapMethod = 0;

let darkMode = false;
let wakeLock = false;
let rotate = false;
let follow = false;


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
  if (!db) {
    log("Error: Database not initialized.", 'error');
    return;
  }
  scenario = document.getElementById('scenario').value;
  saveValue(KEY_NAME_1, scenario);
  mapMethod = document.getElementById('mapMethod').value;
  saveValue(KEY_NAME_2, mapMethod);
  hideAdminButton();
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
	darkmode = document.getElementById('darkmode').checked == true;
	saveValue(KEY_NAME_3, darkmode);
}
function changeWakeLock() {
	wakelock = document.getElementById('wakelock').checked == true;
	saveValue(KEY_NAME_4, wakelock);
}
function changeRotate() {
	rotate = document.getElementById('rotate').checked == true;
	saveValue(KEY_NAME_5, rotate);
}
function changeFollow() {
	follow = document.getElementById('follow').checked == true;
	saveValue(KEY_NAME_6, follow);
}

function loadSettings() {
  if (!db) return;

  const transaction = db.transaction([SETTINGS_STORE_NAME], 'readonly');
  const objectStore = transaction.objectStore(SETTINGS_STORE_NAME);
  log("Loading saved settings from IndexDB");
            
  // Get the specific key
  const request1 = objectStore.get(KEY_NAME_1);

  request1.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  scenario = result;
	  document.getElementById('scenario').value = scenario;
      log(`${KEY_NAME_1}:${result}`, 'success');
    } else {
      log(`${KEY_NAME_1}:not found`);
    }
  };
  // Get the specific key
  const request2 = objectStore.get(KEY_NAME_2);

  request2.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  mapMethod = result;
	  document.getElementById('mapMethod').value = mapMethod;
      log(`${KEY_NAME_2}:${result}`, 'success');
    } else {
      log(`${KEY_NAME_2}:not found`);
    }
  };
  // Get the specific key
  const request3 = objectStore.get(KEY_NAME_3);

  request3.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  darkMode = result;
	  document.getElementById('darkmode').checked = darkMode;
      log(`${KEY_NAME_3}:${result}`, 'success');
    } else {
      log(`${KEY_NAME_3}:false`);
    }
  };
  // Get the specific key
  const request4 = objectStore.get(KEY_NAME_4);

  request4.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  wakeLock = result;
	  document.getElementById('wakelock').checked = wakeLock;
      log(`${KEY_NAME_4}:${result}`, 'success');
    } else {
      log(`${KEY_NAME_4}:false`);
    }
  };
  // Get the specific key
  const request5 = objectStore.get(KEY_NAME_5);

  request5.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  rotate = result;
	  document.getElementById('rotate').checked = rotate;
      log(`${KEY_NAME_5}:${result}`, 'success');
    } else {
      log(`${KEY_NAME_5}:false`);
    }
  };
  // Get the specific key
  const request6 = objectStore.get(KEY_NAME_6);

  request6.onsuccess = (event) => {
    const result = event.target.result;
    if (result) {
	  follow = result;
	  document.getElementById('follow').checked = follow;
      log(`${KEY_NAME_6}:${result}`, 'success');
    } else {
      log(`${KEY_NAME_6}:false`);
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