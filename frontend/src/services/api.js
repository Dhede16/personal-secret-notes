const BASE_URL = '/api';

export const api = {
  async getNotes() {
    try {
      const res = await fetch(`${BASE_URL}/notes`);
      if (!res.ok) {
        throw new Error('Unable to connect to the server.');
      }
      return await res.json();
    } catch (err) {
      throw new Error(err.message || 'Unable to connect to the server.');
    }
  },

  async createNote(data) {
    try {
      const res = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Unable to save note.');
      }
      return await res.json();
    } catch (err) {
      throw new Error(err.message || 'Unable to connect to the server.');
    }
  },

  async updateNote(id, data) {
    try {
      const res = await fetch(`${BASE_URL}/notes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Unable to update note.');
      }
      return await res.json();
    } catch (err) {
      throw new Error(err.message || 'Unable to connect to the server.');
    }
  },

  async deleteNote(id) {
    try {
      const res = await fetch(`${BASE_URL}/notes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Unable to delete this note. Please try again.');
      }
      return await res.json();
    } catch (err) {
      throw new Error(err.message || 'Unable to delete this note. Please try again.');
    }
  },
};
