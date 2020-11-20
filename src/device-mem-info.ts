export interface DeviceMemInfo {
  flashPageSize: number;
  flashSize: number;
  flashStartAddress: number;
  flashEndAddress: number;
  runtimeStartAddress: number;
  runtimeEndAddress: number;
  fsStartAddress: number;
  fsEndAddress: number;
  uPyVersion: string;
  deviceVersion: number;
}

export const enum DeviceVersion {
  one = 1,
  two = 2,
}
