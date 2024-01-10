import { v4 as getIp } from 'internal-ip';

export const getHostIP = () => {
  /**
   * The hardcoded IP address is the address of GitHub actions host
   *
   * TODO: Figure out a better way to dected CI host IP, insted of hardcoding this one
   */
  return process.env.CI ? '172.17.0.1' : getIp.sync() || 'localhost';
};
