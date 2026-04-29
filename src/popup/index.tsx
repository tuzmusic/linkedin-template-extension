import { render } from 'preact';
import { AuthGate } from './AuthGate';
import '../styles/globals.css';

const app = document.getElementById('app');
if (app) {
  render(<AuthGate />, app);
}
