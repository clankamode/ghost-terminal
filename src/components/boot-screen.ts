import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const BOOT_LINES: string[] = [
  'CYBERLOBSTER BIOS v3.7.2',
  'CPU: SYNTH-CORE 9000 ...... OK',
  'MEM: 32768KB .............. OK',
  'NET: LOOPBACK GRID ........ OK',
  'MOUNT /vault .............. OK',
  'INIT HACKSTACK ............ OK',
  'WELCOME, OPERATOR',
];

const LOGO = String.raw`
   ______      __              __              __             __           
  / ____/_  __/ /_  ___  _____/ /   ____  ____/ /___  ____   / /____  _____
 / /   / / / / __ \/ _ \/ ___/ /   / __ \/ __  / __ \/ __ \ / __/ _ \/ ___/
/ /___/ /_/ / /_/ /  __/ /  / /___/ /_/ / /_/ / /_/ / / / // /_/  __/ /    
\____/\__, /_.___/\___/_/  /_____/\____/\__,_/\____/_/ /_/ \__/\___/_/     
     /____/                                                                  
`;

@customElement('boot-screen')
export class BootScreen extends LitElement {
  @property({ type: Boolean, attribute: 'has-continue' })
  hasContinue = false;

  @state()
  private replaySeed = '';

  @state()
  private displayedLines: string[] = [];

  @state()
  private logoVisible = false;

  @state()
  private isReady = false;

  private timers: number[] = [];

  static styles = css`
    :host {
      display: block;
      background: #010201;
      color: #62ff7d;
      border: 1px solid #174b1f;
      min-height: 320px;
      padding: 12px;
      font-family: 'Courier New', Courier, monospace;
    }

    .line {
      margin: 2px 0;
      white-space: pre-wrap;
    }

    .logo {
      margin-top: 10px;
      color: #8cff9e;
      white-space: pre;
      opacity: 0;
      animation: fadeIn 350ms ease forwards;
    }

    .actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button,
    input {
      border: 1px solid #2f8a3f;
      background: #031006;
      color: inherit;
      font: inherit;
      padding: 0.4rem 0.65rem;
    }

    button {
      cursor: pointer;
      text-transform: uppercase;
    }

    button:hover,
    button:focus-visible {
      background: #0a2310;
      outline: none;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.startBoot();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimers();
  }

  render() {
    return html`
      ${this.displayedLines.map((line) => html`<div class="line">${line}</div>`)}
      ${this.logoVisible ? html`<div class="logo">${LOGO}</div>` : null}
      ${this.isReady
        ? html`
            <div class="actions">
              <button type="button" @click=${this.onNewGame}>Start New Run</button>
              ${this.hasContinue
                ? html`<button type="button" @click=${this.onContinueGame}>Continue Game</button>`
                : null}
              <input
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                .value=${this.replaySeed}
                @input=${this.onSeedInput}
                placeholder="Seed"
                aria-label="Replay seed"
              />
              <button type="button" @click=${this.onReplaySeed} ?disabled=${this.replaySeed.trim().length === 0}>
                Replay Seed
              </button>
            </div>
          `
        : null}
    `;
  }

  private startBoot(): void {
    this.clearTimers();
    this.displayedLines = [];
    this.logoVisible = false;
    this.isReady = false;

    const totalDurationMs = 3000;
    const lineSpacing = Math.floor((totalDurationMs * 0.55) / BOOT_LINES.length);

    BOOT_LINES.forEach((line, index) => {
      const timer = window.setTimeout(() => {
        this.typeLine(line);
      }, index * lineSpacing);
      this.timers.push(timer);
    });

    const logoTimer = window.setTimeout(() => {
      this.logoVisible = true;
    }, Math.floor(totalDurationMs * 0.62));
    this.timers.push(logoTimer);

    const readyTimer = window.setTimeout(() => {
      this.isReady = true;
    }, totalDurationMs);
    this.timers.push(readyTimer);
  }

  private typeLine(line: string): void {
    let cursor = 0;
    const partial = '';
    this.displayedLines = [...this.displayedLines, partial];
    const targetIndex = this.displayedLines.length - 1;

    const typer = window.setInterval(() => {
      cursor += 1;
      const lines = [...this.displayedLines];
      lines[targetIndex] = line.slice(0, cursor);
      this.displayedLines = lines;
      if (cursor >= line.length) {
        window.clearInterval(typer);
      }
    }, 14);
    this.timers.push(typer);
  }

  private onNewGame = (): void => {
    this.dispatchEvent(
      new CustomEvent('start-new-game', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  private onContinueGame = (): void => {
    this.dispatchEvent(
      new CustomEvent('continue-game', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  private onSeedInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.replaySeed = input.value.replace(/\D+/g, '');
  };

  private onReplaySeed = (): void => {
    this.dispatchEvent(
      new CustomEvent<{ seed: string }>('start-seeded-game', {
        detail: { seed: this.replaySeed.trim() },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private clearTimers(): void {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
    this.timers = [];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'boot-screen': BootScreen;
  }
}
