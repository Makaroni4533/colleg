import dgram from 'node:dgram';
import { isIPv4 } from 'node:net';

const [mode = 'unicast', address, ...words] = process.argv.slice(2);
const groups = ['239.255.10.10', '239.255.10.11'];
const target = mode === 'multicast' ? address ?? groups[0] :
  address ?? (mode === 'unicast' ? '127.0.0.1' : undefined);
if (!['unicast', 'broadcast', 'multicast'].includes(mode) || !target || !isIPv4(target) ||
    (mode === 'multicast' && !groups.includes(target))) {
  console.error('Использование: node sender.mjs unicast|broadcast|multicast <IPv4> [текст]');
  process.exit(1);
}

const text = mode.toUpperCase() + ': ' + (words.join(' ').trim() || 'NetLab announcement');
const socket = dgram.createSocket('udp4');

function fail(error) {
  console.error('[SENDER ERROR]', error.code, error.message);
  process.exitCode = 1;
  socket.close();
}

socket.on('error', fail);
socket.bind(0, () => {
  try {
    if (mode === 'broadcast') socket.setBroadcast(true);
    if (mode === 'multicast') {
      socket.setMulticastTTL(1);
      socket.setMulticastLoopback(true);
      if (process.env.MULTICAST_IFACE) socket.setMulticastInterface(process.env.MULTICAST_IFACE);
    }
    socket.send(text, 3030, target, error => {
      if (error) return fail(error);
      console.log('Датаграмма передана ОС:', target + ':3030', text);
      socket.close();
    });
  } catch (error) {
    fail(error);
  }
});
