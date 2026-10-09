import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import net from 'net';
import dns from 'dns/promises';
import prisma from '../../config/prisma.js';

const execFileAsync = promisify(execFile);
const MAX_HOSTS = 254;
const PROBE_PORTS = [80, 443, 22, 445, 3389, 8080, 9100];

// Helper to convert IP to number for iteration
function ipToNum(ip) {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0);
}

// Helper to convert number back to IP
function numToIp(num) {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

const isPrivateIp = (ip) => {
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
};

export function getLocalNetworks() {
  const networks = [];
  for (const [name, addresses] of Object.entries(os.networkInterfaces())) {
    for (const item of addresses || []) {
      if (item.internal || item.family !== 'IPv4' || !isPrivateIp(item.address)) continue;
      const address = ipToNum(item.address);
      const mask = ipToNum(item.netmask);
      const network = (address & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const first = Math.max(network + 1, ((address & 0xffffff00) >>> 0) + 1);
      const last = Math.min(broadcast - 1, ((address & 0xffffff00) >>> 0) + 254, first + MAX_HOSTS - 1);
      if (first > last) continue;
      networks.push({ name, address: item.address, netmask: item.netmask,
        ipStart: numToIp(first), ipEnd: numToIp(last), network, broadcast });
    }
  }
  return networks.sort((a, b) => Number(/wi-?fi|wlan/i.test(b.name)) - Number(/wi-?fi|wlan/i.test(a.name)));
}

export function validateLocalRange(ipStart, ipEnd, networks = getLocalNetworks()) {
  if (net.isIP(ipStart) !== 4 || net.isIP(ipEnd) !== 4) throw new Error('Enter valid IPv4 start and end addresses.');
  const start = ipToNum(ipStart);
  const end = ipToNum(ipEnd);
  if (end < start || end - start + 1 > MAX_HOSTS) throw new Error(`Choose an increasing range of at most ${MAX_HOSTS} addresses.`);
  const scanner = networks.find(item => start > item.network && end < item.broadcast);
  if (!scanner) throw new Error('This range is not on a private local network connected to the scanning server.');
  return { start, end, scanner };
}

// ICMP can be disabled on a device, so common TCP services provide a second signal.
async function pingIp(ip) {
  const isWindows = os.platform() === 'win32';
  try {
    const { stdout } = await execFileAsync('ping', isWindows
      ? ['-n', '1', '-w', '900', ip] : ['-c', '1', '-W', '1', ip],
    { timeout: 1400, windowsHide: true });
    return isWindows ? /TTL=/i.test(stdout) : true;
  } catch { return false; }
}

function probePort(ip, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: ip, port });
    let done = false;
    const finish = (reachable) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(reachable);
    };
    socket.setTimeout(450);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function isReachable(ip) {
  const [ping, ports] = await Promise.all([pingIp(ip), Promise.all(PROBE_PORTS.map(port => probePort(ip, port)))]);
  return ping || ports.some(Boolean);
}

async function identifyIp(ip, mdnsName = '') {
  const [names, arp] = await Promise.all([
    Promise.race([dns.reverse(ip).catch(() => []), new Promise(resolve => setTimeout(() => resolve([]), 700))]),
    execFileAsync('arp', ['-a', ip], { timeout: 1200, windowsHide: true }).then(result => result.stdout).catch(() => '')
  ]);
  const escaped = ip.replaceAll('.', '\\.');
  const macPattern = new RegExp(`(?:^|\\s)${escaped}\\s+([0-9a-f]{2}(?:[:-][0-9a-f]{2}){5})`, 'im');
  const macAddress = arp.match(macPattern)?.[1]?.replaceAll('-', ':').toUpperCase() || '';
  
  let manufacturer = '';
  let deviceType = 'Device';
  if (macAddress) {
    const oui = macAddress.substring(0, 8);
    const commonVendors = {
      'C8:9C:BB': { mfg: 'Huawei / Taicang', type: 'Network Router' },
      'E8:65:D4': { mfg: 'Samsung', type: 'Smartphone' },
      'D4:E8:53': { mfg: 'Apple', type: 'iPhone / Mac' },
      '2E:BC:E0': { mfg: 'Private MAC', type: 'Mobile Device' },
      '78:BE:81': { mfg: 'Xiaomi', type: 'Smartphone' },
      'D8:80:83': { mfg: 'Intel', type: 'Laptop / PC' },
      '50:5A:65': { mfg: 'Apple', type: 'iPhone / Mac' },
      '00:15:5D': { mfg: 'Microsoft', type: 'Virtual Machine' }
    };
    if (commonVendors[oui]) {
      manufacturer = commonVendors[oui].mfg;
      deviceType = commonVendors[oui].type;
    } else {
      // Fallback for single devices
      try {
        const response = await fetch(`https://api.macvendors.com/${encodeURIComponent(macAddress)}`, { signal: AbortSignal.timeout(1000) });
        if (response.ok) manufacturer = await response.text();
      } catch (e) { }
    }
  }

  // Prioritize mDNS > DNS Reverse > NetBIOS
  let hostname = mdnsName || names[0] || '';
  if (!hostname && os.platform() === 'win32') {
    try {
      const { stdout } = await execFileAsync('nbtstat', ['-A', ip], { timeout: 1000, windowsHide: true });
      const nbtMatch = stdout.match(/(\S+)\s+<[0-9A-Z]{2}>\s+UNIQUE/i);
      if (nbtMatch) hostname = nbtMatch[1];
    } catch (e) { /* Ignore nbtstat failures */ }
  }

  return { 
    ipAddress: ip, 
    hostname,
    macAddress,
    manufacturer,
    deviceType,
    discoverySource: 'IP Range Scan', 
    status: 'New', 
    lastSeen: new Date().toISOString() 
  };
}

import { Bonjour } from 'bonjour-service';

export class DiscoveryEngine {
  static async runIpScan(ipStart, ipEnd, jobId = 'MANUAL-SCAN') {
    const { start: startNum, end: endNum, scanner } = validateLocalRange(ipStart, ipEnd);
    const started = Date.now();
    const targets = Array.from({ length: endNum - startNum + 1 }, (_, index) => numToIp(startNum + index));
    const aliveIps = [];
    let next = 0;

    // Start mDNS sweep concurrently
    const mdnsNames = {};
    const bonjour = new Bonjour();
    bonjour.find({}, (service) => {
      const ip = service.addresses?.[0];
      if (ip && service.host) {
        mdnsNames[ip] = service.host.replace('.local', '');
      }
    });

    await Promise.all(Array.from({ length: Math.min(32, targets.length) }, async () => {
      while (next < targets.length) {
        const ip = targets[next++];
        if (await isReachable(ip)) aliveIps.push(ip);
      }
    }));
    
    // Stop mDNS
    bonjour.destroy();
    
    // Stealth Device Fallback: Check the ARP cache for devices that ignored the pings
    try {
      const { stdout: arpTable } = await execFileAsync('arp', ['-a']);
      const arpRegex = /([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+([0-9a-f-]{17})\s+dynamic/ig;
      let match;
      while ((match = arpRegex.exec(arpTable)) !== null) {
        const ip = match[1];
        const num = ipToNum(ip);
        if (num >= startNum && num <= endNum && !aliveIps.includes(ip)) {
          aliveIps.push(ip);
        }
      }
    } catch (e) { /* Ignore arp errors */ }

    // Always include the scanner machine itself
    if (scanner && scanner.address && !aliveIps.includes(scanner.address)) {
      const num = ipToNum(scanner.address);
      if (num >= startNum && num <= endNum) aliveIps.push(scanner.address);
    }

    aliveIps.sort((a, b) => ipToNum(a) - ipToNum(b));
    const devices = await Promise.all(aliveIps.map(ip => identifyIp(ip, mdnsNames[ip])));
    let persisted = true;
    let persistenceError = '';
    for (const device of devices) {
      try {
        const now = new Date();
        const existing = await prisma.discoveryObservation.findFirst({
          where: { ipAddress: device.ipAddress, discoverySource: 'IP Range Scan' },
          orderBy: { lastSeen: 'desc' }
        });
        const data = {
          ipAddress: device.ipAddress, hostname: device.hostname || null,
          macAddress: device.macAddress || null, discoverySource: 'IP Range Scan',
          manufacturer: device.manufacturer || null, osFamily: device.deviceType || null,
          lastSeen: now, rawCollectorPayload: JSON.stringify({
            jobName: jobId, scanMethod: 'ICMP/TCP', observedAt: now.toISOString(),
            deviceType: device.deviceType || 'Device'
          })
        };
        const observation = existing
          ? await prisma.discoveryObservation.update({ where: { id: existing.id }, data })
          : await prisma.discoveryObservation.create({ data });
        device.id = observation.id;

        // IP alone is only a suggestion because DHCP addresses can change.
        const confirmed = await prisma.discoveryMatch.findFirst({
          where: { observationId: observation.id, status: 'CONFIRMED' }
        });
        if (!confirmed) {
          const asset = await prisma.asset.findFirst({ where: { OR: [
            { ipAddress: device.ipAddress },
            ...(device.macAddress ? [{ macAddress: device.macAddress }] : [])
          ] } });
          if (asset) {
            const suggested = await prisma.discoveryMatch.findFirst({
              where: { observationId: observation.id, status: 'SUGGESTED' }
            });
            const macMatch = Boolean(device.macAddress && asset.macAddress?.toUpperCase() === device.macAddress);
            const suggestion = { matchedAssetId: asset.id, confidenceScore: macMatch ? 75 : 40,
              matchRule: macMatch ? 'MAC_ADDRESS' : 'IP_ADDRESS', status: 'SUGGESTED' };
            if (suggested) await prisma.discoveryMatch.update({ where: { id: suggested.id }, data: suggestion });
            else await prisma.discoveryMatch.create({ data: { observationId: observation.id, ...suggestion } });
            device.status = 'Review';
            device.matchedAssetId = asset.assetId;
          }
        }
      } catch (error) {
        persisted = false;
        persistenceError = error.message || 'Database unavailable';
        break;
      }
    }
    return { scanned: targets.length, aliveCount: devices.length, aliveIps, devices,
      persisted, persistenceError, scannerAddress: scanner.address,
      durationMs: Date.now() - started, completedAt: new Date().toISOString() };
  }
}
