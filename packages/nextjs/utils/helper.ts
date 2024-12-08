import { SUPPORTED_BLOCKCHAINS } from "./constants";

export const addToLocalStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const removeFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

export const getRandomId = (): string => {
  return crypto.randomUUID();
};

export const getBlockchainNameFromId = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return SUPPORTED_BLOCKCHAINS.ETHEREUM;
    case 137:
      return SUPPORTED_BLOCKCHAINS.POLYGON;
    case 56:
      return SUPPORTED_BLOCKCHAINS.BSC;
    case 8453:
      return SUPPORTED_BLOCKCHAINS.BASE;
    default:
      return "UNKNOWN";
  }
};
