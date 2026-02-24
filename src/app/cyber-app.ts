import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('cyber-app')
export class CyberApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .terminal {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 2rem;
      box-sizing: border-box;
    }

    .screen {
      width: min(960px, 100%);
      border: 1px solid rgba(0, 255, 65, 0.55);
      padding: 1.5rem;
      background: rgba(0, 20, 0, 0.55);
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.16), inset 0 0 30px rgba(0, 255, 65, 0.06);
    }

    pre {
      margin: 0;
      white-space: pre;
      overflow-x: auto;
      line-height: 1.2;
      color: #00ff41;
      text-shadow: 0 0 8px rgba(0, 255, 65, 0.45);
    }

    .boot {
      margin-top: 1rem;
      font-size: 1rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #00ff41;
    }
  `;

  render() {
    return html`
      <main class="terminal" role="main" aria-label="CyberLobster terminal">
        <section class="screen">
          <pre aria-label="CyberLobster logo">
   ____      __             __          __               __            
  / ___/_ __/ /  ___ ______/ /  ___ ___/ /  ___  ___ ___/ /____ ____    
 / /__/ // / _ \/ -_) __/ _  /  / -_) _  /__/ _ \/ -_|_-< __/ -_) __/    
 \___/\_, /_.__/\__/_/  \_,_/   \__/\_,_/(_)\___/\__/___/\__/\__/_/      
      /___/                                                                
          </pre>
          <p class="boot">CyberLobster v0.1 -- INITIALIZING...</p>
        </section>
      </main>
    `;
  }
}
