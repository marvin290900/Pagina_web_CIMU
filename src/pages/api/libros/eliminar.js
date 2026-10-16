import { json } from '../../../lib/security/http.js';
export function DELETE() { return json({error:'Usa archivar para conservar el historial. La eliminación definitiva está deshabilitada.'},409); }
