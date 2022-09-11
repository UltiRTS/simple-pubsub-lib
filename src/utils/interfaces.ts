export interface IncomingMsg {
  action: string;
  topic: string;
}

export interface PublishMsg extends IncomingMsg {
  change: string;
}

export interface ActionReceipt {
  status: boolean;
  msg: string;
}

export interface SubscribeNotice {
  topic: string;
  change: string;
}
