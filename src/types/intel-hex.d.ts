/**
 * Type declaration for the nrf-intel-hex object. More info:
 * https://github.com/NordicSemiconductor/nrf-intel-hex/blob/v1.1.0/intel-hex.js
 */
declare module 'nrf-intel-hex';

declare class MemoryMap {
  constructor(blocks: Iterator<[number, Uint8Array]>);

  // These go straight through to the internal Map methods of this._blocks
  // All keys are numeric and all values Uint8Arrays
  get(addr: number): any;
  clear(): void;
  delete(addr: number): boolean;
  entries(): Iterator<[number, Uint8Array]>;
  forEach(
    callbackfn: (
      value: Uint8Array,
      index: number,
      map: Map<number, Uint8Array>
    ) => void,
    thisArg?: any
  ): void;
  has(addr: number): boolean;
  keys(): Iterator<number>;
  values(): Iterator<Uint8Array>;

  // Defined in the class
  set(addr: number, value: Uint8Array): Map<number, Uint8Array>;
  fromHex(hexText: string, maxBlockSize?: number): MemoryMap;
  join(maxBlockSize: number): MemoryMap;
  // TODO: overlapMemoryMaps(memoryMaps);
  // TODO: flattenOverlaps(overlaps);
  paginate(pageSize: number, pad: number): MemoryMap;
  getUint32(offset: number, littleEndian?: boolean): number | undefined;
  asHexString(lineSize?: number): string;
  clone(): MemoryMap;
  fromPaddedUint8Array(
    bytes: Uint8Array,
    padByte?: number,
    minPadLength?: number
  ): MemoryMap;
  slice(address: number, length?: number): MemoryMap;
  slicePad(address: number, length: number, padByte?: number): Uint8Array;
  contains(memMap: MemoryMap): boolean;
}
