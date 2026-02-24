import { LitElement, css, html } from 'lit';
import { getTopScores, type LeaderboardEntry } from '../lib/leaderboard';

export class LeaderboardPanel extends LitElement {
  static properties = {
    entries: { state: true },
    isLoading: { state: true },
    errorMessage: { state: true },
  };

  private entries: LeaderboardEntry[] = [];
  private isLoading = true;
  private errorMessage: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    void this.loadScores();
  }

  private async loadScores(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      this.entries = await getTopScores(10);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load leaderboard';
    } finally {
      this.isLoading = false;
    }
  }

  private renderTable(): string {
    const rows = this.entries.map((entry) => [
      String(entry.rank),
      entry.name,
      String(entry.score),
      String(entry.level),
      String(entry.systemsBreached),
    ]);

    const header = ['RANK', 'NAME', 'SCORE', 'LEVEL', 'BREACH'];
    const widths = header.map((head, col) =>
      Math.max(head.length, ...rows.map((row) => (row[col] ?? '').length))
    );

    const border = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
    const format = (cols: string[]) =>
      `| ${cols.map((col, index) => col.padEnd(widths[index], ' ')).join(' | ')} |`;

    return [
      border,
      format(header),
      border,
      ...rows.map((row) => format(row)),
      border,
    ].join('\n');
  }

  render() {
    if (this.isLoading) {
      return html`<pre>[ syncing leaderboard... ]</pre>`;
    }

    if (this.errorMessage) {
      return html`<pre>[ error ] ${this.errorMessage}</pre>`;
    }

    if (this.entries.length === 0) {
      return html`<pre>[ no leaderboard entries yet ]</pre>`;
    }

    return html`<pre>${this.renderTable()}</pre>`;
  }

  static styles = css`
    :host {
      display: block;
      color: #81f781;
      background: #050505;
      border: 1px solid #1f7a1f;
      padding: 0.75rem;
      font-family: 'IBM Plex Mono', 'Fira Code', 'Courier New', monospace;
      overflow-x: auto;
    }

    pre {
      margin: 0;
      white-space: pre;
      line-height: 1.4;
      font-size: 0.875rem;
    }
  `;
}

customElements.define('leaderboard-panel', LeaderboardPanel);

declare global {
  interface HTMLElementTagNameMap {
    'leaderboard-panel': LeaderboardPanel;
  }
}
