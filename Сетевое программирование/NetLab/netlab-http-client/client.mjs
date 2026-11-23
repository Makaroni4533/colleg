import { setTimeout as delay } from 'node:timers/promises';

const baseUrl = 'http://127.0.0.1:3041';

async function request(path, { method = 'GET', body, timeout = 1500 } = {}) {
  const started = performance.now();
  console.log('\n' + method + ' ' + path);
  try {
    const response = await fetch(baseUrl + path, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeout)
    });
    const raw = await response.text();
    let data = raw;
    try {
      data = JSON.parse(raw);
    } catch {}
    console.log('HTTP status:', response.status);
    console.log('response.ok:', response.ok);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Cache-Control:', response.headers.get('cache-control'));
    console.log('Body:', data);
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    const code = error.cause?.code ?? error.name;
    if (code === 'ECONNREFUSED') console.error(code, 'Запустите node netlab-http/server.mjs.');
    else console.error(code, error.message);
    return { ok: false, code };
  } finally {
    console.log('Time:', Math.round(performance.now() - started), 'ms');
  }
}

async function getStatus() {
  const result = await request('/api/status');
  if (!['ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'TimeoutError'].includes(result.code)) return result;
  console.log('Повтор GET /api/status через 350 мс');
  await delay(350);
  return request('/api/status');
}

function getEvents() {
  return request('/api/events');
}

function createEvent(station, message) {
  return request('/api/events', { method: 'POST', body: { station, message } });
}

async function demo() {
  const status = await getStatus();
  if (!status.ok) return status;
  const initial = await getEvents();
  const created = await createEvent('PC-07', 'REQUEST_HELP');
  const updated = await getEvents();
  const missing = await request('/missing');
  const unavailable = await request('/api/error');
  const invalid = await createEvent('PC-07', '');
  const wrongMethod = await request('/api/events', { method: 'PUT' });
  const timedOut = await request('/api/slow?ms=3000', { timeout: 1000 });
  const completed = await request('/api/slow?ms=3000', { timeout: 4000 });
  return {
    ok: initial.status === 200 && created.status === 201 && updated.status === 200 &&
      missing.status === 404 && unavailable.status === 503 && invalid.status === 400 &&
      wrongMethod.status === 405 && timedOut.code === 'TimeoutError' && completed.status === 200
  };
}

const [command = 'demo', station, ...words] = process.argv.slice(2);
let result;
if (command === 'status') result = await getStatus();
else if (command === 'events') result = await getEvents();
else if (command === 'demo') result = await demo();
else if (command === 'send' && station?.trim() && words.join(' ').trim()) {
  result = await createEvent(station, words.join(' '));
} else {
  console.error('Использование: node client.mjs demo|status|events|send <станция> <сообщение>');
}
if (!result?.ok) process.exitCode = 1;
