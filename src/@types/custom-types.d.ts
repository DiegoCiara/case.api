// custom-types.d.ts
declare module 'mediainfo-wrapper' {
  export default function mediaInfo(filePath: string): Promise<any>;
}// custom-types.d.ts

declare module 'probe-image-size' {
  export default function probe(imageS3Location: string): Promise<any>;
}
declare module 'crypto-js' {
  var AES: any;
  var enc: any;
  var format: any;
}// custom-types.d.ts

declare module 'currency.js' {
  export default function currency(value: number | string, options?: object): {
    format: () => string;
    add: (value: number | string) => any;
    subtract: (value: number | string) => any;
    multiply: (value: number | string) => any;
    divide: (value: number | string) => any;
  };
}
declare module 'media-converter' {
  export default function convert(webm?: any, ogg?: any, callback: any): any;
}
