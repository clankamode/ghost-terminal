import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('status-bar')
export class StatusBar extends LitElement {
  @property({ type: Number, reflect: true })
  level = 1;

  @property({ type: Number, reflect: true })
  score = 0;

  @property({ type: Number, reflect: true })
  lives = 3;

  @property({ type: Number, reflect: true })
  time = 0;

  @property({ type: Number, attribute: 'trace', reflect: true })
  tracePercent = 0;

  static styles = css`
    :host {
      display: block;
      background: #050505;
      color: #d7fbd8;
      border: 1px solid #246326;
      font-family: 'Courier New', Courier, monospace;
      padding: 8px 10px;
      letter-spacing: 0.02em;
    }

    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .trace-high {
      color: #ff4d4d;
      animation: traceFlash 0.9s steps(1, end) infinite;
      font-weight: bold;
    }

    @keyframes traceFlash {
      50% {
        background: rgba(255, 77, 77, 0.25);
      }
    }
  `;

  render() {
    const traceClass = this.tracePercent > 75 ? 'trace-high' : '';
    return html`
      <div class="bar">
        <span>LEVEL ${this.level}</span>
        <span>|</span>
        <span>SCORE ${this.score}</span>
        <span>|</span>
        <span>LIVES ${this.lives}</span>
        <span>|</span>
        <span>TIME ${this.time}s</span>
        <span>|</span>
        <span class=${traceClass}>TRACE ${this.tracePercent}%</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'status-bar': StatusBar;
  }
}
