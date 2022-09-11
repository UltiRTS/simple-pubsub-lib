import * as crypto from 'crypto';

export const hashAddr = (addr: string) => {
  return crypto.createHash('md5').update(addr).digest('hex');
};
