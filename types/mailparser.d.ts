declare module 'mailparser' {
  export function simpleParser(source: string | Buffer | NodeJS.ReadableStream): Promise<any>;
} 