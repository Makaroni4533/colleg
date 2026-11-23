import dgram from 'node:dgram';
import { createInterface } from 'node:readline';

const groups = ['239.255.10.10', '239.255.10.11'];
const selection = process.argv[2] ?? '1';
if (!['1', '2', 'both', 'none'].includes(selection)) {
  console.error('Использование: node receiver.mjs [1|2|both|none]');
  process.exit(1);
}

const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
const terminal = createInterface({ input: process.stdin, output: process.stdout });
let stopping = false;

function stop() {
  if (stopping) return;
  stopping = true;
  terminal.close();
  process.stdin.destroy();
  socket.close();
}

terminal.on('line', line => {
  if (line.trim().toUpperCase() === 'STOP') stop();
});
terminal.on('SIGINT', stop);
process.on('SIGINT', stop);
socket.on('error', error => {
  console.error('[RECEIVER ERROR]', error.code, error.message);
  process.exitCode = 1;
  stop();
});
socket.on('message', (message, sender) => {
  console.log(new Date().toISOString(), '[RECEIVED]', JSON.stringify(message.toString('utf8')), 'FROM', sender.address + ':' + sender.port);
});
socket.bind(3030, '0.0.0.0', () => {
  for (const [index, group] of groups.entries()) {
    if (selection !== 'both' && selection !== String(index + 1)) continue;
    try {
      socket.addMembership(group, process.env.MULTICAST_IFACE);
      console.log('Подписка:', group);
    } catch (error) {
      console.error('Ошибка подписки:', group, error.message);
    }
  }
  console.log('UDP :3030 · STOP завершает приёмник');
});
