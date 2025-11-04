const notesService = require('../services/notes');

class NotesController {
  // PUBLIC_INTERFACE
  /**
   * List all notes.
   */
  list(req, res, next) {
    try {
      const notes = notesService.list();
      return res.status(200).json(notes);
    } catch (err) {
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a note by id.
   */
  get(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Invalid id parameter' });
      }
      const note = notesService.getById(id);
      return res.status(200).json(note);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new note.
   */
  create(req, res, next) {
    try {
      const created = notesService.create(req.body || {});
      return res.status(201).json(created);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing note by id.
   */
  update(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Invalid id parameter' });
      }
      const updated = notesService.update(id, req.body || {});
      return res.status(200).json(updated);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      return next(err);
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note by id.
   */
  remove(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Invalid id parameter' });
      }
      notesService.delete(id);
      return res.status(204).send();
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      return next(err);
    }
  }
}

module.exports = new NotesController();
