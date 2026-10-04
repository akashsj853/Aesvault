/**
 * AESVault Persistent Local Storage & State Management
 * Emulates SQLite tables in browser local storage for complete standalone execution.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface FileHistoryRecord {
  id: string;
  userId: string;
  originalFilename: string;
  encryptedFilename: string;
  fileSize: number;
  operation: 'Encryption' | 'Decryption';
  status: 'Success' | 'Failed';
  createdAt: string;
}

const STORAGE_KEY_USERS = 'aesvault_users_db';
const STORAGE_KEY_SESSION = 'aesvault_active_session';
const STORAGE_KEY_HISTORY = 'aesvault_files_db';

// Seed demo user on first load
function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    const demoUser = {
      id: 'user_1',
      name: 'Alex Morgan',
      email: 'student@aesvault.local',
      passwordHash: 'pbkdf2:sha256:aesvault2026', // Simulated hash representation
      createdAt: '2026-10-01 10:00:00'
    };
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([demoUser]));
  }

  if (!localStorage.getItem(STORAGE_KEY_HISTORY)) {
    const seedHistory: FileHistoryRecord[] = [
      {
        id: 'hist_1',
        userId: 'user_1',
        originalFilename: 'project_architecture.pdf',
        encryptedFilename: 'project_architecture.pdf.enc',
        fileSize: 1420500,
        operation: 'Encryption',
        status: 'Success',
        createdAt: '2026-10-02 14:22:10'
      },
      {
        id: 'hist_2',
        userId: 'user_1',
        originalFilename: 'database_backup.sql',
        encryptedFilename: 'database_backup.sql.enc',
        fileSize: 524288,
        operation: 'Encryption',
        status: 'Success',
        createdAt: '2026-10-02 18:05:40'
      },
      {
        id: 'hist_3',
        userId: 'user_1',
        originalFilename: 'database_backup.sql',
        encryptedFilename: 'database_backup.sql.enc',
        fileSize: 524288,
        operation: 'Decryption',
        status: 'Success',
        createdAt: '2026-10-02 18:30:15'
      }
    ];
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(seedHistory));
  }
}

initDatabase();

export function getActiveUser(): User | null {
  const sessionData = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export function setActiveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }
}

export function registerUser(name: string, email: string, password: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  
  if (!cleanName || !cleanEmail || !password) {
    throw new Error("All fields are required.");
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error("Please enter a valid email address.");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const rawUsers = localStorage.getItem(STORAGE_KEY_USERS) || '[]';
  const users = JSON.parse(rawUsers);

  if (users.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error("An account with this email address already exists.");
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: `pbkdf2:sha256:${password}`,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  const safeUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt
  };
  setActiveUser(safeUser);
  return safeUser;
}

export function loginUser(email: string, password: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const rawUsers = localStorage.getItem(STORAGE_KEY_USERS) || '[]';
  const users = JSON.parse(rawUsers);

  const matched = users.find((u: any) => u.email.toLowerCase() === cleanEmail);
  if (!matched) {
    throw new Error("Invalid email or password.");
  }

  // Verify demo credential or stored hash
  if (cleanEmail === 'student@aesvault.local' && password === 'aesvault2026') {
    const user: User = { id: matched.id, name: matched.name, email: matched.email, createdAt: matched.createdAt };
    setActiveUser(user);
    return user;
  }

  if (matched.passwordHash === `pbkdf2:sha256:${password}`) {
    const user: User = { id: matched.id, name: matched.name, email: matched.email, createdAt: matched.createdAt };
    setActiveUser(user);
    return user;
  }

  throw new Error("Invalid email or password.");
}

export function updateUserProfile(userId: string, newName: string): User {
  const rawUsers = localStorage.getItem(STORAGE_KEY_USERS) || '[]';
  const users = JSON.parse(rawUsers);
  const user = users.find((u: any) => u.id === userId);
  if (!user) throw new Error("User not found.");

  user.name = newName.trim();
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  const safeUser: User = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  setActiveUser(safeUser);
  return safeUser;
}

export function recordFileOperation(
  userId: string,
  originalFilename: string,
  encryptedFilename: string,
  fileSize: number,
  operation: 'Encryption' | 'Decryption',
  status: 'Success' | 'Failed'
): FileHistoryRecord {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY) || '[]';
  const history: FileHistoryRecord[] = JSON.parse(raw);

  const newRecord: FileHistoryRecord = {
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    originalFilename,
    encryptedFilename,
    fileSize,
    operation,
    status,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  history.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  return newRecord;
}

export function getUserHistory(userId: string, filter: string = 'All', search: string = ''): FileHistoryRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY) || '[]';
  const allHistory: FileHistoryRecord[] = JSON.parse(raw);

  return allHistory.filter(rec => {
    if (rec.userId !== userId) return false;
    if (filter === 'Encryption' && rec.operation !== 'Encryption') return false;
    if (filter === 'Decryption' && rec.operation !== 'Decryption') return false;
    if (search) {
      const q = search.toLowerCase();
      const orig = rec.originalFilename.toLowerCase();
      const enc = rec.encryptedFilename.toLowerCase();
      if (!orig.includes(q) && !enc.includes(q)) return false;
    }
    return true;
  });
}

export function getUserStatistics(userId: string) {
  const history = getUserHistory(userId, 'All', '');
  const encs = history.filter(h => h.operation === 'Encryption').length;
  const decs = history.filter(h => h.operation === 'Decryption').length;
  const totalBytes = history.reduce((acc, h) => acc + (h.fileSize || 0), 0);

  return {
    totalOperations: history.length,
    encryptedCount: encs,
    decryptedCount: decs,
    totalBytesProcessed: totalBytes
  };
}

export function clearUserHistory(userId: string) {
  const raw = localStorage.getItem(STORAGE_KEY_HISTORY) || '[]';
  const allHistory: FileHistoryRecord[] = JSON.parse(raw);
  const remaining = allHistory.filter(h => h.userId !== userId);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(remaining));
}
