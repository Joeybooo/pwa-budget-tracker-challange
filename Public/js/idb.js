let db;

const request = indexedDB.open("budgetTracker", 1);

request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("transaction_new", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onerror = (event) => {
    console.log(err.message);
};

request.onsuccess = (event) => {
    db = event.target.results;
    if (navigator.online) {
        checkDatabase();
    }
};

function saveRecord(record) {
    const transaction = db.transaction("transaction_new", "readwrite");
    const store = transaction.objectStore("transaction_new");
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction("transaction_new", "readonly");
    const store = transaction.objectStore("transaction_new");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.lengeth > 0) {
            fetch("/api/transaction/bulk", {
                method: "Post",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            })
            .then((response) => response.json())
            .then(() => {
                const transaction = db.transaction("transaction_new", "readwrite");
                const store = transaction.objectStore("transaction_new");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", checkDatabase);