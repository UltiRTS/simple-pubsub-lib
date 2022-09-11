import {UniPubSubClient} from '../utils/client';

const pub = new UniPubSubClient('ws://127.0.0.1:6789');

const main = async () => {
  pub.ws.on('open', () => {
    setInterval(() => {
      pub.publish('mods', 'latest mods hash');
    }, 5000);
  });
};

main();
