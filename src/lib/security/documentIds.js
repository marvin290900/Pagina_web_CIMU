const STANDARD_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
// Researcher profiles created by the previous UI use their email as a document
// ID. Preserve that opaque ID while excluding path/query/encoding characters
// that older endpoints could interpret as part of a CouchDB URL.
const LEGACY_PROFILE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._+-]*@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;

export function isSafeDocumentId(value) {
  if (typeof value !== 'string' || /[\s\x00-\x1f\x7f]/.test(value)) return false;
  return STANDARD_ID.test(value)
    || (value.length <= 254 && !value.includes('..') && LEGACY_PROFILE_ID.test(value));
}
