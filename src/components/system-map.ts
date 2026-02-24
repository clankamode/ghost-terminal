import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type SystemState = 'locked' | 'accessible' | 'breached' | 'defended';

export interface SystemNode {
  id: string;
  label: string;
  state: SystemState;
}

@customElement('system-map')
export class SystemMap extends LitElement {
  @property({ type: Array })
  nodes: SystemNode[] = [];

  @property({ type: String })
  selectedNodeId = '';

  static styles = css`
    :host {
      display: block;
      background: #040404;
      color: #a5a5a5;
      border: 1px solid #2a2a2a;
      padding: 10px 12px;
      font-family: 'Courier New', Courier, monospace;
      white-space: pre;
      overflow-x: auto;
      line-height: 1.35;
    }

    .legend {
      margin-bottom: 8px;
      white-space: normal;
      font-size: 12px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .node {
      cursor: pointer;
      user-select: none;
    }

    .selected {
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .locked {
      color: #8f8f8f;
    }

    .accessible {
      color: #ffcf40;
    }

    .breached {
      color: #57ff75;
    }

    .defended {
      color: #ff4d4d;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.nodes.length === 0) {
      this.nodes = [
        { id: 'n1', label: 'GATEWAY', state: 'accessible' },
        { id: 'n2', label: 'AUTH', state: 'locked' },
        { id: 'n3', label: 'DATAVAULT', state: 'locked' },
        { id: 'n4', label: 'OPS', state: 'defended' },
        { id: 'n5', label: 'ROOT', state: 'locked' },
      ];
    }
  }

  render() {
    return html`
      <div class="legend">
        ${this.legendItem('locked', 'locked')}
        ${this.legendItem('accessible', 'accessible')}
        ${this.legendItem('breached', 'breached')}
        ${this.legendItem('defended', 'defended')}
      </div>
      <div>
        ${this.renderNode(0)}─┬─${this.renderNode(1)}─┬─${this.renderNode(2)}
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─${this.renderNode(3)}─────┘
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─${this.renderNode(4)}
      </div>
    `;
  }

  private legendItem(state: SystemState, label: string) {
    return html`<span class=${state}><i class="dot ${state}"></i>${label}</span>`;
  }

  private renderNode(index: number) {
    const node = this.nodes[index];
    if (!node) {
      return html`[N/A]`;
    }
    const isSelected = this.selectedNodeId === node.id;
    return html`<span
      role="button"
      tabindex="0"
      class="node ${node.state} ${isSelected ? 'selected' : ''}"
      @click=${() => this.selectNode(node)}
      @keydown=${(event: KeyboardEvent) => this.onNodeKeyDown(event, node)}
      >[${node.label}]</span
    >`;
  }

  private onNodeKeyDown(event: KeyboardEvent, node: SystemNode): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectNode(node);
    }
  }

  private selectNode(node: SystemNode): void {
    this.selectedNodeId = node.id;
    this.dispatchEvent(
      new CustomEvent('node-selected', {
        detail: { node },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'system-map': SystemMap;
  }
}
