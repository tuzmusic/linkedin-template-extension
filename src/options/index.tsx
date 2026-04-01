import { render } from 'preact';
import { Options } from './Options';
import '../styles/globals.css';

const app = document.getElementById('app');
if (app) {
  render(<Options />, app);
}
