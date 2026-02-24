import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { clearLeaderboard, getLeaderboard, type LeaderboardEntry } from '../lib/leaderboard';

@customElement('leaderboard-panel')
export class LeaderboardPanel extends LitElement {
  @state()
  private entries: LeaderboardEntry[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.refresh();
  }

  private refresh(): void {
    this.entries = getLeaderboard();
  }

  private onClear = (): void => {
    clearLeaderboard();
    this.refresh();
    this.dispatchEvent(new CustomEvent('leaderboard-cleared', { bubbles: true, composed: true }));
  };

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '--';
    }
    return date.toLocaleDateString();
  }

  private renderRows() {
    return this.entries.map(
      (entry, index) => html`
        <tr class=${index === 0 ? 'top-rank' : ''}>
          <td>#${index + 1}</td>
          <td>${entry.score}</td>
          <td>${entry.level}</td>
          <td>${this.formatDate(entry.date)}</td>
        </tr>
      `,
    );
  }

  render() {
    return html`
      <section class="panel" aria-label="Leaderboard">
        <header class="head">
          <h2>TOP RUNS</h2>
          <button type="button" @click=${this.onClear}>CLEAR</button>
        </header>
        ${this.entries.length === 0
          ? html`<p class="empty">No runs yet</p>`
          : html`
              <table>
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>SCORE</th>
                    <th>LEVEL</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderRows()}
                </tbody>
              </table>
            `}
      </section>
    `;
  }

  static styles = css`
    :host {
      display: block;
      color: #92f6a5;
      font-family: 'Courier New', Courier, monospace;
    }

    .panel {
      background: #050505;
      border: 1px solid #1f7a1f;
      padding: 0.75rem;
      overflow-x: auto;
    }

    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    h2 {
      margin: 0;
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    button {
      border: 1px solid #2f8a3f;
      background: #031006;
      color: inherit;
      font: inherit;
      padding: 0.2rem 0.45rem;
      cursor: pointer;
      text-transform: uppercase;
    }

    button:hover,
    button:focus-visible {
      background: #0a2310;
      outline: none;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    th,
    td {
      border: 1px solid #19561f;
      padding: 0.3rem 0.4rem;
      text-align: left;
      white-space: nowrap;
    }

    th {
      color: #63ff83;
      letter-spacing: 0.03em;
    }

    .top-rank td {
      color: #ffda66;
      font-weight: 700;
    }

    .empty {
      margin: 0.5rem 0 0;
      color: #acd8af;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'leaderboard-panel': LeaderboardPanel;
  }
}
