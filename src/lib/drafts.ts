// Form drafts (farmer registration, KPI entry, issues, visit outcomes) hold personal data, so they live in
// sessionStorage — gone when the tab closes — and are wiped on sign-out. Replace with a drafts API when one exists.

const PREFIX = "oan:draft:";

// Keys earlier builds wrote to localStorage; removed on sign-out so old personal data does not linger.
const LEGACY_LOCAL_KEYS = ["oan:farmer-registration-draft", "oan:new-issue-draft", "oan:kpi-entry-draft"];
const LEGACY_LOCAL_PREFIX = "oan.visit-outcome-draft.";

/** The parsed draft, or null when none is stored, it is unreadable, or storage is blocked. */
export function readDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Throws when storage is unavailable (private mode, quota) so the caller can tell the user. */
export function writeDraft<T>(key: string, draft: T): void {
  sessionStorage.setItem(PREFIX + key, JSON.stringify(draft));
}

export function removeDraft(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // storage unavailable — nothing to clear
  }
}

/** Drops every draft, including ones older builds left in localStorage. Called on sign-out. */
export function clearAllDrafts(): void {
  const sweep = (storage: Storage, matches: (key: string) => boolean) => {
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (key && matches(key)) storage.removeItem(key);
    }
  };
  try {
    sweep(sessionStorage, (k) => k.startsWith(PREFIX));
    sweep(localStorage, (k) => LEGACY_LOCAL_KEYS.includes(k) || k.startsWith(LEGACY_LOCAL_PREFIX));
  } catch {
    // storage unavailable — nothing to clear
  }
}
