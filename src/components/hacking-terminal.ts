import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

type TerminalLine = {
  text: string;
  color?: string;
};

@customElement('hacking-terminal')
export class HackingTerminal extends LitElement {
  @property({ type: String })
  prompt = '> ';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @query('#commandInput')
  private commandInput?: HTMLInputElement;

  private history: TerminalLine[] = [];
  private command = '';
  private audioContext?: AudioContext;

  static styles = css`
    :host {
      display: block;
      background: #020603;
      color: #4dff6f;
      border: 1px solid #164f21;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      line-height: 1.4;
      min-height: 320px;
      padding: 12px;
      position: relative;
      overflow: hidden;
    }

    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        to bottom,
        rgba(77, 255, 111, 0.04),
        rgba(77, 255, 111, 0.04) 1px,
        transparent 1px,
        transparent 3px
      );
      pointer-events: none;
      mix-blend-mode: screen;
    }

    .terminal {
      position: relative;
      z-index: 1;
    }

    .history {
      min-height: 260px;
      max-height: 340px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin-bottom: 8px;
    }

    .line {
      margin: 1px 0;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .prompt {
      color: #7cff93;
      user-select: none;
    }

    input {
      flex: 1;
      background: transparent;
      border: 0;
      outline: none;
      color: inherit;
      font: inherit;
      caret-color: transparent;
      padding: 0;
      margin: 0;
    }

    .cursor {
      width: 9px;
      height: 1.2em;
      display: inline-block;
      background: #4dff6f;
      animation: blink 1s step-end infinite;
      vertical-align: text-bottom;
      margin-left: 2px;
    }

    :host([disabled]) .cursor,
    :host([disabled]) input {
      opacity: 0.45;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.tabIndex = 0;
  }

  firstUpdated(): void {
    this.focus();
  }

  render() {
    return html`
      <div class="terminal" @click=${this.focus}>
        <div class="history">
          ${this.history.map(
            (line) =>
              html`<div class="line" style=${line.color ? `color:${line.color}` : ''}>
                ${line.text}
              </div>`,
          )}
        </div>
        <div class="input-row">
          <span class="prompt">${this.prompt}</span>
          <input
            id="commandInput"
            .value=${this.command}
            ?disabled=${this.disabled}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            @input=${this.onInput}
            @keydown=${this.onKeyDown}
          />
          <span class="cursor" aria-hidden="true"></span>
        </div>
      </div>
    `;
  }

  printLine(text: string, color?: string): void {
    this.history = [...this.history, { text, color }].slice(-30);
    this.requestUpdate();
    queueMicrotask(() => {
      const container = this.renderRoot.querySelector('.history');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  clear(): void {
    this.history = [];
    this.requestUpdate();
  }

  override focus(): void {
    if (!this.disabled) {
      this.commandInput?.focus();
    }
  }

  private onInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this.command = target.value;
    this.playTypingBlip();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' || this.disabled) {
      return;
    }
    const value = this.command.trim();
    this.printLine(`${this.prompt}${this.command}`);
    this.command = '';
    this.dispatchEvent(
      new CustomEvent('terminal-command', {
        detail: { command: value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private playTypingBlip(): void {
    if (this.disabled) {
      return;
    }
    try {
      const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) {
        return;
      }
      if (!this.audioContext) {
        this.audioContext = new Ctx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => undefined);
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.value = 0.003;
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      const now = this.audioContext.currentTime;
      osc.start(now);
      osc.stop(now + 0.012);
    } catch {
      // Typing audio is optional.
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hacking-terminal': HackingTerminal;
  }
}
