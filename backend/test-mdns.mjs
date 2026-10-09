import { Bonjour } from 'bonjour-service';

const bonjour = new Bonjour();
console.log('Scanning local network via mDNS (Bonjour)...');

const knownHosts = {};

bonjour.find({}, (service) => {
  const ip = service.addresses?.[0];
  const name = service.host;
  if (ip && name && !knownHosts[ip]) {
    knownHosts[ip] = name.replace('.local', '');
    console.log(`Discovered via mDNS -> IP: ${ip}, Hostname: ${knownHosts[ip]}`);
  }
});

setTimeout(() => {
  console.log('mDNS Scan Complete.', knownHosts);
  process.exit(0);
}, 4000);
