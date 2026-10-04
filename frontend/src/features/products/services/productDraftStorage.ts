const DB_NAME = "vendora-product-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";

interface StoredDraft {
  key: string;
  products: unknown;
  updatedAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "key",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open draft storage."));
  });
}

export async function saveProductDraft(
  userId: string,
  products: unknown
): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put({
      key: userId,
      products,
      updatedAt: Date.now(),
    } satisfies StoredDraft);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ??
          new Error("Unable to save product draft.")
      );
  });

  db.close();
}

export async function loadProductDraft(
  userId: string
): Promise<unknown | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userId);

    request.onsuccess = () => {
      db.close();

      const result = request.result as StoredDraft | undefined;
      resolve(result?.products ?? null);
    };

    request.onerror = () => {
      db.close();
      reject(
        request.error ??
          new Error("Unable to load product draft.")
      );
    };
  });
}

export async function clearProductDraft(
  userId: string
): Promise<void> {
  const db = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.delete(userId);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ??
          new Error("Unable to clear product draft.")
      );
  });

  db.close();
}
