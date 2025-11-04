const fs = require('fs');
const path = require('path');

// Simple file path for persistence during dev; if file not present, will use in-memory store and create file on first write.
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

/**
 * Ensure the data directory exists.
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load notes from file if available, otherwise return empty array.
 */
function loadFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // If parse fails, fall back to empty
    console.error('Failed to load notes file, falling back to empty store:', e.message);
  }
  return [];
}

/**
 * Persist notes to file. Ensures directory exists.
 * @param {Array<object>} notes 
 */
function saveToFile(notes) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
  } catch (e) {
    console.error('Failed to persist notes file:', e.message);
  }
}

class NotesService {
  constructor() {
    // Initialize from file if present
    this.notes = loadFromFile();
    // Track next id as simple incremental integer
    this.nextId = this.notes.length > 0 ? Math.max(...this.notes.map(n => n.id || 0)) + 1 : 1;
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new note with required title and optional content.
   * @param {{title: string, content?: string}} payload 
   * @returns {{id:number, title:string, content:string, createdAt:string, updatedAt:string}}
   */
  create(payload) {
    if (!payload || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      const error = new Error('Validation error: "title" is required.');
      error.status = 400;
      throw error;
    }
    const now = new Date().toISOString();
    const note = {
      id: this.nextId++,
      title: payload.title.trim(),
      content: typeof payload.content === 'string' ? payload.content : '',
      createdAt: now,
      updatedAt: now,
    };
    this.notes.push(note);
    saveToFile(this.notes);
    return note;
  }

  // PUBLIC_INTERFACE
  /**
   * Return all notes.
   * @returns {Array<object>}
   */
  list() {
    return this.notes;
  }

  // PUBLIC_INTERFACE
  /**
   * Get a note by id.
   * @param {number} id 
   * @returns {object}
   */
  getById(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) {
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }
    return note;
  }

  // PUBLIC_INTERFACE
  /**
   * Update a note by id. Title is required if present; we allow partial updates for content but PUT generally expects full resource.
   * @param {number} id 
   * @param {{title?: string, content?: string}} payload 
   * @returns {object}
   */
  update(id, payload) {
    const idx = this.notes.findIndex(n => n.id === id);
    if (idx === -1) {
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }
    // For PUT, require title
    if (!payload || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      const error = new Error('Validation error: "title" is required.');
      error.status = 400;
      throw error;
    }
    const current = this.notes[idx];
    const updated = {
      ...current,
      title: payload.title.trim(),
      content: typeof payload.content === 'string' ? payload.content : (current.content || ''),
      updatedAt: new Date().toISOString(),
    };
    this.notes[idx] = updated;
    saveToFile(this.notes);
    return updated;
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note by id.
   * @param {number} id 
   * @returns {void}
   */
  delete(id) {
    const idx = this.notes.findIndex(n => n.id === id);
    if (idx === -1) {
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }
    this.notes.splice(idx, 1);
    saveToFile(this.notes);
  }
}

module.exports = new NotesService();
