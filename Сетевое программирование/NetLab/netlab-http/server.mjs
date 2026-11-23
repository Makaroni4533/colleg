import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const events = new Map();
const stations = ['PC-01', 'PC-02', 'PC-07'].map(name => ({ name }));
let nextId = 1;
let requests = 0;

function json(res, status, data) {
  if (res.destroyed) return;
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function methodNotAllowed(res, allow) {
  res.setHeader('Allow', allow);
  json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
}

async function createEvent(req, res) {
  const type = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') return json(res, 415, { error: 'JSON_REQUIRED' });

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= 4096) chunks.push(chunk);
  }
  if (size > 4096) return json(res, 413, { error: 'BODY_TOO_LARGE' });

  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return json(res, 400, { error: 'INVALID_JSON' });
  }
  const station = typeof body?.station === 'string' ? body.station.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!station || station.length > 40 || !message || message.length > 120) {
    return json(res, 400, { error: 'INVALID_EVENT' });
  }

  const event = { id: nextId++, station, message, createdAt: new Date().toISOString() };
  events.set(event.id, event);
  res.setHeader('Location', '/api/events/' + event.id);
  json(res, 201, event);
}

const links = {
  '/api/status': 'Статус сервера',
  '/api/about': 'О NetLab',
  '/api/stations': 'Учебные станции',
  '/api/events': 'События',
  '/api/events/1': 'Событие №1',
  '/api/slow?ms=3000': 'Ответ с задержкой',
  '/api/error': 'Ошибка 503'
};
const home = '<!doctype html><html lang="ru"><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>NetLab HTTP</title><style>' +
  'body{background:#101827;color:#f0f5ff;font:1rem system-ui;margin:4rem auto;padding:0 1.5rem;max-width:42rem}' +
  'ul{list-style:none;padding:0;display:grid;gap:.6rem}a{display:block;padding:.8rem 1rem;background:#1e2c43;color:#a7dbff;border-radius:.6rem}' +
  '</style><main><h1>NetLab HTTP</h1><ul>' +
  Object.entries(links).map(([path, name]) => '<li><a href="' + path + '">' + name + '</a></li>').join('') +
  '</ul></main></html>';

const routes = {
  '/': (_, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(home);
  },
  '/api/status': (_, res) => json(res, 200, {
    service: 'NetLab', status: 'online', eventsCount: events.size, requests, time: new Date().toISOString()
  }),
  '/api/about': (_, res) => json(res, 200, { name: 'NetLab', version: '1.0.0' }),
  '/api/stations': (_, res) => json(res, 200, { stations }),
  '/api/error': (_, res) => json(res, 503, { error: 'SERVICE_UNAVAILABLE' }),
  '/api/slow': async (url, res) => {
    const ms = Number(url.searchParams.get('ms') ?? 3000);
    const delayedMs = Number.isFinite(ms) ? Math.trunc(Math.max(0, Math.min(ms, 5000))) : 3000;
    await delay(delayedMs);
    json(res, 200, { delayedMs });
  }
};

const server = http.createServer(async (req, res) => {
  requests++;
  const { method } = req;
  res.on('finish', () => console.log(method, req.url, '->', res.statusCode));
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const path = url.pathname;
    if (path === '/api/events') {
      if (method === 'GET') return json(res, 200, { events: [...events.values()] });
      if (method === 'POST') return await createEvent(req, res);
      return methodNotAllowed(res, 'GET, POST');
    }

    const match = /^\/api\/events\/(\d+)$/.exec(path);
    if (match) {
      if (method !== 'GET' && method !== 'DELETE') return methodNotAllowed(res, 'GET, DELETE');
      const id = Number(match[1]);
      if (!events.has(id)) return json(res, 404, { error: 'NOT_FOUND' });
      if (method === 'GET') return json(res, 200, events.get(id));
      events.delete(id);
      res.writeHead(204, { 'Cache-Control': 'no-store' });
      return res.end();
    }

    if (!Object.hasOwn(routes, path)) return json(res, 404, { error: 'NOT_FOUND' });
    if (method !== 'GET') return methodNotAllowed(res, 'GET');
    await routes[path](url, res);
  } catch (error) {
    if (req.aborted || res.destroyed) return;
    if (error.code === 'ERR_INVALID_URL') return json(res, 400, { error: 'INVALID_URL' });
    console.error(error);
    if (!res.headersSent) json(res, 500, { error: 'INTERNAL_ERROR' });
    else res.destroy();
  }
});
server.on('error', error => {
  console.error(error.code, error.message);
  process.exitCode = 1;
});
server.listen(3041, '127.0.0.1', () => console.log('NetLab HTTP · http://127.0.0.1:3041'));
