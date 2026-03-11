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

  @property({ type: Number, reflect: true })
  streak = 0;

  @property({ type: Number, attribute: 'trace', reflect: true })
  tracePercent = 0;

  @property({ type: Number, reflect: true })
  seed = 0;

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
      font-size: clamp(11px, 2.5vw, 14px);
    }

    .item {
      white-space: nowrap;
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

    @media (max-width: 600px) {
      .bar {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px 10px;
        align-items: start;
        font-size: 13px;
      }
    }
  `;

  render() {
    const traceClass = this.tracePercent > 75 ? 'trace-high' : '';
    return html`
      <div class="bar">
        <span class="item">LEVEL ${this.level}</span>
        <span class="item">SCORE ${this.score}</span>
        <span class="item">LIVES ${this.lives}</span>
        <span class="item">TIME ${this.time}s</span>
        <span class="item">STREAK ${this.streak}</span>
        <span class="item">SEED ${this.seed}</span>
        <span class="item ${traceClass}">TRACE ${this.tracePercent}%</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'status-bar': StatusBar;
  }
}
