import { Application } from './app';
import './styles/index.module.less';

function main() {
  const root = document.getElementById('root');
  if (root) {
    const application = new Application(root);
    application.start();
  }
}

main();
