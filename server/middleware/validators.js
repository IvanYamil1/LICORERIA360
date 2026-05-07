// Validadores y sanitizadores compartidos para inputs.
// Lanzan { status, message } si el input no cumple, lo cual el handler global atrapa.

const mongoose = require('mongoose');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function badRequest(message) {
  throw new HttpError(400, message);
}

function strField(value, fieldName, { max, min = 0, required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) badRequest(`${fieldName} es requerido`);
    return undefined;
  }
  const s = String(value).trim();
  if (s.length < min) badRequest(`${fieldName} muy corto (mín ${min})`);
  if (max && s.length > max) badRequest(`${fieldName} muy largo (máx ${max})`);
  return s;
}

function numField(value, fieldName, { min, max, integer = false } = {}) {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) badRequest(`${fieldName} debe ser numérico`);
  if (integer && !Number.isInteger(n)) badRequest(`${fieldName} debe ser entero`);
  if (min !== undefined && n < min) badRequest(`${fieldName} mín ${min}`);
  if (max !== undefined && n > max) badRequest(`${fieldName} máx ${max}`);
  return n;
}

function enumField(value, fieldName, options) {
  if (value === undefined) return undefined;
  if (!options.includes(value)) {
    badRequest(`${fieldName} inválido`);
  }
  return value;
}

function objectIdParam(req, paramName = 'id') {
  const v = req.params[paramName];
  if (!mongoose.isValidObjectId(v)) badRequest(`${paramName} inválido`);
  return v;
}

module.exports = { HttpError, strField, numField, enumField, objectIdParam };
