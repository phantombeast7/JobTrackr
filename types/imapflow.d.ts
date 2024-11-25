declare module 'imapflow' {
  export interface ImapFlowOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    logger: boolean;
    tls?: {
      rejectUnauthorized: boolean;
      servername?: string;
    };
    clientInfo?: {
      name: string;
      version: string;
      vendor: string;
    };
  }

  export interface MessageMove {
    uid: string;
  }

  export class ImapFlow {
    constructor(options: ImapFlowOptions);
    connect(): Promise<void>;
    logout(): Promise<void>;
    append(folder: string, content: string, flags?: string[]): Promise<MessageMove>;
    messageMove(uid: string, destination: string, options?: { byUid: boolean }): Promise<void>;
    mailboxOpen(mailbox: string): Promise<void>;
    mailboxCreate(mailbox: string): Promise<void>;
    mailboxDelete(mailbox: string): Promise<void>;
    mailboxRename(source: string, destination: string): Promise<void>;
    mailboxExists(mailbox: string): Promise<boolean>;
  }
} 