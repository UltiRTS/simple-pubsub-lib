import {OPEN, WebSocketServer, WebSocket} from 'ws';
import {
  ActionReceipt,
  IncomingMsg,
  PublishMsg,
  SubscribeNotice,
} from './interfaces';
import {hashAddr} from './util';

export class Provider {
  server: WebSocketServer;
  topics: {
    [topic: string]: {
      time: Date;
      info: string;
    };
  } = {};

  clients: {
    [key: string]: {
      subscribedTopics: string[];
      socket: WebSocket;
    };
  } = {};

  constructor(options: {port: number}) {
    this.server = new WebSocketServer({
      port: options.port,
    });

    this.server.on('listening', () => {
      console.log(`provider is listening at port ${options.port}`);
    });

    this.server.on('connection', (client, req) => {
      if (req.socket.remoteAddress === undefined) return;

      const clientID = hashAddr(
        req.socket.remoteAddress + req.socket.remotePort
      );
      console.log(clientID);

      console.log(
        `clent ${req.socket.remoteAddress}:${req.socket.remotePort} is connecting`
      );

      if (!(clientID in this.clients)) {
        this.clients[clientID] = {
          subscribedTopics: [],
          socket: client,
        };
      }
      client.on('message', (data, isBin) => {
        const msg: IncomingMsg = JSON.parse(data.toString());
        const addr = req.socket.remoteAddress;
        console.log(this.topics);

        switch (msg.action) {
          case 'publish': {
            const pub_msg = msg as PublishMsg;
            if (!addr?.includes('127.0.0.1')) {
              const receipt: ActionReceipt = {
                status: true,
                msg: 'unauthorized client',
              };
              client.send(JSON.stringify(receipt));
              return;
            }

            if (!(msg.topic in this.topics)) {
              this.topics[msg.topic] = {
                time: new Date(),
                info: pub_msg.change,
              };
            } else {
              this.topics[msg.topic].time = new Date();
              this.topics[msg.topic].info = pub_msg.change;

              // notify all clients
              for (const id in this.clients) {
                const client = this.clients[id];
                console.log(id, client.subscribedTopics);
                if (
                  client.subscribedTopics.includes(msg.topic) &&
                  client.socket.readyState === OPEN
                ) {
                  client.socket.send(
                    JSON.stringify({
                      topic: msg.topic,
                      change: pub_msg.change,
                    } as SubscribeNotice)
                  );
                }
              }
            }

            break;
          }
          case 'subscribe': {
            if (!(msg.topic in this.topics)) {
              this.topics[msg.topic] = {
                time: new Date(),
                info: '',
              };
            }

            if (!(clientID in this.clients)) {
              this.clients[clientID] = {
                socket: client,
                subscribedTopics: [msg.topic],
              };
            } else {
              if (!(msg.topic in this.clients[clientID].subscribedTopics))
                this.clients[clientID].subscribedTopics.push(msg.topic);
            }

            client.send(
              JSON.stringify({
                topic: msg.topic,
                change: this.topics[msg.topic].info,
              } as SubscribeNotice)
            );

            break;
          }
        }
      });
    });
  }
}
