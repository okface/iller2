import { AppUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new AppUI(document.getElementById('app'));
  app.init().catch(err => {
    document.getElementById('app').innerHTML = `<div style="padding:2rem;">Fel vid laddning av frågor.<br><small>${err.message}</small></div>`;
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
});
