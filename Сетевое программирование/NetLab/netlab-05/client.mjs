import net from 'node:net';
import { createInterface } from 'node:readline';

const socket = net.createConnection({ host: '127.0.0.1', port: 3020, allowHalfOpen: true });
const terminal = createInterface({ input: process.stdin, output: process.stdout, prompt: 'NetLab> ' });
const incoming = createInterface({ input: socket, crlfDelay: Infinity, terminal: false });

socket.on('connect', () => terminal.prompt());
incoming.on('line', line => {
  console.log('\n' + line);
  if (!socket.readableEnded) terminal.prompt(true);
});
terminal.on('line', line => {
  if (!socket.writableEnded) socket.write(line + '\n');
});
socket.on('end', () => socket.end());
socket.on('error', error => {
  console.error(error.code, error.message);
  process.exitCode = 1;
});
socket.on('close', () => terminal.close());
terminal.on('close', () => socket.end());
