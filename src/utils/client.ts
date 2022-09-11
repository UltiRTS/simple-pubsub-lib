import {WebSocket} from 'ws';
import {IncomingMsg, PublishMsg, SubscribeNotice} from './interfaces';

export class UniPubSubClient {
  ws: WebSocket;

  constructor(provider_addr: string) {
    this.ws = new WebSocket(provider_addr);
    this.ws.on('message', (data, isBin) => {
      const msg = JSON.parse(data.toString());
      console.log(msg);
    });
  }

  publish(topic: string, info: string) {
    this.ws.send(
      JSON.stringify({
        action: 'publish',
        topic,
        change: info,
      } as PublishMsg)
    );
  }

  subscribe(topic: string, callback: (topic: string, info: string) => void) {
    this.ws.send(
      JSON.stringify({
        action: 'subscribe',
        topic: topic,
      } as IncomingMsg)
    );
    this.ws.on('message', (data, isBin) => {
      const msg: SubscribeNotice = JSON.parse(data.toString());
      if (msg.topic === topic) {
        callback(msg.topic, msg.change);
      }
    });
  }
}
