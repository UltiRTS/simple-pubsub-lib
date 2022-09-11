import {UniPubSubClient} from '../utils/client';

const pub = new UniPubSubClient('ws:/127.0.0.1:6789');

const main = async () => {
  pub.ws.on('open', () => {
    pub.subscribe('mods', (topic: string, info: string) => {
      console.log(`${topic} get updated with info ${info}`);
    });
  });
};

main();
