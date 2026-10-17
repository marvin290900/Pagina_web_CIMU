import test from 'node:test';
import assert from 'node:assert/strict';
import { newsActions, newsSectionsFor, stateLabel, dateLabel, newsRecordUrl, videoEmbedUrl } from '../src/lib/publicationUi.js';
const person = role => ({id:role,status:'active',assignments:[{role,modules:['gaceta'],sections:['opinion']}]});
test('record toolbar and state bar expose only permitted transitions',()=>{
  const doc={_id:'news',tipo:'opinion',createdBy:'colaborador',editorialStatus:'borrador'};
  assert.deepEqual(newsSectionsFor(person('colaborador')),['opinion']);
  assert.deepEqual(newsActions(person('colaborador'),doc,'opinion').map(a=>a.target),['en_revision']);
  assert.deepEqual(newsActions(person('consulta'),doc,'opinion'),[]);
  assert.deepEqual(newsActions(person('director'),doc,'actualidad'),[]);
  const archived={...doc,editorialStatus:'archivado',archivedFrom:'publicado'};
  assert(newsActions(person('director'),archived,'opinion').some(a=>a.target==='publicado'));
  assert.equal(stateLabel('en_revision'),'En revisión');assert.equal(stateLabel(null),'Sin clasificar');
  assert.equal(dateLabel(null),'—');assert.equal(dateLabel('invalid'),'—');
  assert.equal(newsRecordUrl(doc),'/admin/gaceta/publicacion/news?categoria=opinion');
});
test('video preview accepts YouTube links and rejects executable or unrelated URLs',()=>{
  assert.equal(videoEmbedUrl('https://youtu.be/abcdefghijk'),'https://www.youtube-nocookie.com/embed/abcdefghijk');
  assert.equal(videoEmbedUrl('https://www.youtube.com/watch?v=abcdefghijk'),'https://www.youtube-nocookie.com/embed/abcdefghijk');
  for(const value of ['javascript:alert(1)','https://evil.test/embed/abcdefghijk','https://youtube.com.evil.test/watch?v=abcdefghijk','http://youtu.be/invalid'])assert.equal(videoEmbedUrl(value),'');
});
