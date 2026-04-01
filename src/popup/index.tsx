import { render } from 'preact';
import { Popup } from './Popup';
import '../styles/globals.css';

const app = document.getElementById('app');
if (app) {
  render(<Popup />, app);
}
