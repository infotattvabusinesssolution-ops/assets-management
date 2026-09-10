import { EventEmitter } from 'events';

class RtlsRealtimeEngine extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
  }

  addClient(res) {
    this.clients.add(res);
  }

  removeClient(res) {
    this.clients.delete(res);
  }

  broadcast(eventType, payload) {
    const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      client.write(data);
    }
  }

  notifyLocationUpdate(locationUpdate) {
    this.broadcast('location_update', locationUpdate);
  }

  notifyMovement(movement) {
    this.broadcast('movement', movement);
  }

  notifyAlert(alert) {
    this.broadcast('rtls_alert', alert);
  }

  notifyHeartbeat(heartbeat) {
    this.broadcast('reader_heartbeat', heartbeat);
  }
}

export const realtimeEngine = new RtlsRealtimeEngine();
