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

export const generateIpAddresses = function* () {
  for (const network of NETWORKS) {
    // Quét tất cả các địa chỉ từ .1 đến .254 trong mỗi dải mạng
    for (let i = 1; i <= 254; i++) {
      yield `${network}.${i}`;
    }
  }
};