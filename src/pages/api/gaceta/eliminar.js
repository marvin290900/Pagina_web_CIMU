import { json } from '../../../lib/security/http.js';
// Preserve attribution and published URLs. Archiving has an explicit permission and audit trail.
export function DELETE() { return json({ error: 'Usa archivar para conservar el historial. La eliminación definitiva está deshabilitada.' }, 409); }
