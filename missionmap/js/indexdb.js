// Open or create a database
let dbPromise = indexedDB.open("missionMapSettings", 1);

// When the database opens successfully
dbPromise.then(function(db) {
    // Create an object store
    let objectStore = db.createObjectStore("myStore", { keyPath: "id" });

    // Insert data
    objectStore.add({ id: 1, name: "Alice" });

    // Query data
    let transaction = db.transaction(["myStore"], "readonly");
    let store = transaction.objectStore("myStore");
    let request = store.get(1);

    request.onsuccess = function(event) {
        console.log("Retrieved data:", event.target.result);
    };
});