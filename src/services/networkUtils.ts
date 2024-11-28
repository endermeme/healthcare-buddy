export const NETWORKS = [
  '192.168.1',
  '192.168.0',
  '10.0.0',
  '172.16.0',
  '192.168.2',
  '192.168.88',
  '192.168.3',
  '192.168.4'
];

export const DEFAULT_DEVICE_PORT = '15';

export const generateIpAddresses = function* () {
  for (const network of NETWORKS) {
    yield `${network}.${DEFAULT_DEVICE_PORT}`;
  }
};