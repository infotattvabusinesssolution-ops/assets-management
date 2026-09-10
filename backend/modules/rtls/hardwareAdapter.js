/**
 * Hardware Abstraction Layer for Fixed RFID Readers (LLRP/Impinj/Zebra/Alien Protocol Adapters)
 */

export class ReaderAdapter {
  constructor(config = {}) {
    this.config = config;
    this.isConnected = false;
  }

  async connect() {
    throw new Error('connect() must be implemented by hardware adapter');
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented by hardware adapter');
  }

  async getStatus() {
    throw new Error('getStatus() must be implemented by hardware adapter');
  }

  async triggerInventoryScan() {
    throw new Error('triggerInventoryScan() must be implemented by hardware adapter');
  }
}

/**
 * Mock & Simulator Adapter for Development and Hardware-Free Testing
 */
export class MockRtlsHardwareAdapter extends ReaderAdapter {
  constructor(config = {}) {
    super(config);
    this.readerIdentifier = config.readerIdentifier || 'R-1001-GATEWAY';
    this.manufacturer = config.manufacturer || 'Impinj';
    this.modelName = config.modelName || 'Speedway R420';
    this.isConnected = true;
  }

  async connect() {
    this.isConnected = true;
    return { success: true, message: `Connected to simulator ${this.readerIdentifier}` };
  }

  async disconnect() {
    this.isConnected = false;
    return { success: true, message: `Disconnected from simulator ${this.readerIdentifier}` };
  }

  async getStatus() {
    return {
      success: true,
      readerIdentifier: this.readerIdentifier,
      status: this.isConnected ? 'ONLINE' : 'OFFLINE',
      firmwareVersion: 'v5.14.0-SIM',
      temperatureC: 42.5,
      antennasConnected: [1, 2, 3, 4]
    };
  }

  /**
   * Generates simulated RFID raw event payload
   */
  async simulateTagRead({ epc, readerId, antennaId = 1, rssi = -55, rawPayload = {} }) {
    return {
      epc,
      readerId: readerId || this.readerIdentifier,
      antennaId: String(antennaId),
      rssi,
      timestamp: new Date().toISOString(),
      rawPayload: {
        frequencyMHz: 915.2,
        phaseAngle: 180,
        dopplerShift: 0.5,
        protocol: 'EPCglobal Class 1 Gen 2',
        ...rawPayload
      }
    };
  }
}

export const defaultMockAdapter = new MockRtlsHardwareAdapter();
