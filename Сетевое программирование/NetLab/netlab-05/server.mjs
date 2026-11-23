import net from 'node:net';

const clients = new Map();
const maxClients = Number(process.env.NETLAB_MAX_CLIENTS ?? 5);
let nextId = 1;

function broadcast(message, except) {
  for (const socket of clients.keys()) {
    if (socket !== except && !socket.writableEnded) socket.write(message + '\n');
  }
}

const server = net.createServer(socket => {
  socket.on('error', error => console.error('[SOCKET ERROR]', error.code));
  if (clients.size >= maxClients) {
    socket.end('ERROR SERVER_FULL\n');
    return;
  }

  const state = { id: 'user-' + nextId++, port: socket.remotePort, commands: 0 };
  clients.set(socket, state);
  const send = line => socket.write(line + '\n');
  let pending = Buffer.alloc(0);
  let warning;
  let deadline;

  function finish(line) {
    clearTimeout(warning);
    clearTimeout(deadline);
    socket.end(line + '\n', () => socket.destroy());
  }

  function resetIdle() {
    clearTimeout(warning);
    clearTimeout(deadline);
    warning = setTimeout(() => send('WARNING IDLE'), 15000);
    deadline = setTimeout(() => {
      console.log('[TIMEOUT]', state.id);
      finish('ERROR IDLE_TIMEOUT');
    }, 20000);
  }

  console.log(new Date().toISOString(), '[CONNECT]', state.id, socket.remoteAddress, state.port);
  send('WELCOME ' + state.id);
  broadcast('[SYSTEM] ' + state.id + ' joined', socket);
  resetIdle();

  socket.on('data', chunk => {
    if (socket.writableEnded) return;
    resetIdle();
    pending = Buffer.concat([pending, chunk]);
    let index;
    while ((index = pending.indexOf(10)) >= 0) {
      const raw = pending.subarray(0, index);
      pending = pending.subarray(index + 1);
      const size = raw.length - Number(raw.at(-1) === 13);
      if (size > 1024) return finish('ERROR LINE_TOO_LONG');
      const line = raw.toString('utf8').trim();
      if (!line) continue;
      state.commands++;
      if (line === 'PING') send('PONG');
      else if (line === 'STATS') send('STATS clients=' + clients.size + ' commands=' + state.commands);
      else if (line === 'WHO') send('WHO ' + [...clients.values()].map(user => user.id + ':' + user.port).join(' '));
      else if (line === 'HELP') send('HELP PING | STATS | WHO | HELP | IDLE | SAY <text> | QUIT');
      else if (line === 'IDLE') send('IDLE 20');
      else if (line === 'QUIT') return finish('BYE');
      else if (line === 'SAY') send('ERROR EMPTY_MESSAGE');
      else if (line.startsWith('SAY ')) {
        broadcast('[' + state.id + '] ' + line.slice(4).trim(), socket);
        send('SENT');
      } else send('ERROR UNKNOWN_COMMAND');
    }
    if (pending.length - Number(pending.at(-1) === 13) > 1024) finish('ERROR LINE_TOO_LONG');
  });

  socket.on('close', () => {
    clearTimeout(warning);
    clearTimeout(deadline);
    clients.delete(socket);
    console.log(new Date().toISOString(), '[CLOSE]', state.id, 'active=' + clients.size);
    broadcast('[SYSTEM] ' + state.id + ' left');
  });
});

server.on('error', error => {
  console.error('[SERVER ERROR]', error.code, error.message);
  process.exitCode = 1;
});
server.listen(3020, '127.0.0.1', () => console.log('NetLab TCP · 127.0.0.1:3020'));
