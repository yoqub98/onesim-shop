// src/config/api.js
// Local dev uses explicit backend URL; staging/prod defaults to relative /api.
export const API_BASE = process.env.REACT_APP_API_BASE || '/api';

