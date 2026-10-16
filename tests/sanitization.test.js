import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
test('stored previews strip scripts, event handlers and unsafe links',async()=>{
  const dom=new JSDOM('');const old=globalThis.window;globalThis.window=dom.window;
  try {
    const {sanitizeHtml}=await import('../src/lib/security/sanitize.js');
    const html=sanitizeHtml('<p>Texto seguro</p><img src=x onerror="alert(1)"><a href="javascript:alert(1)">Link</a><script>alert(1)</script><iframe src="https://evil.test"></iframe>');
    assert(html.includes('Texto seguro'));assert(!html.includes('onerror'));assert(!html.includes('javascript:'));assert(!html.includes('<script'));assert(!html.includes('<iframe'));
    delete globalThis.window;assert.equal(sanitizeHtml('<script>bad</script>'),'');
  }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old;dom.window.close();}
});
