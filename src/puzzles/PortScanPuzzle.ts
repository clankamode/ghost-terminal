import { BasePuzzle } from './BasePuzzle';

interface PortEntry {
  port: number;
  service: string;
  version: string;
  vulnerable: boolean;
}

const SERVICE_POOL = [
  { service: 'FTP', secure: false },
  { service: 'SSH', secure: true },
  { service: 'HTTP', secure: false },
  { service: 'HTTPS', secure: true },
  { service: 'SMTP', secure: false },
  { service: 'DNS', secure: true },
  { service: 'TELNET', secure: false },
  { service: 'RDP', secure: true },
];

const MAX_ATTEMPTS = 3;

export class PortScanPuzzle extends BasePuzzle {
  private ports: PortEntry[] = [];
  private vulnerablePort = 0;
  private clue = '';
  private attemptsUsed = 0;

  constructor(difficulty: number) {
    super(40 + difficulty * 20, difficulty);
  }

  start(): string {
    this.buildPorts();
    this.attemptsUsed = 0;
    const rows = this.ports
      .map((entry) => `${entry.port}/tcp  ${entry.service}  ${entry.version}`)
      .join('\n');

    return [
      'Scan result:',
      rows,
      `Clue: ${this.clue}`,
      `Type the vulnerable port number. Attempts: ${MAX_ATTEMPTS}.`,
    ].join('\n');
  }

  solve(input: string): boolean {
    const normalized = this.normalizeInput(input);
    if (!/^\d+$/.test(normalized)) {
      this.dispatchEvent(
        new CustomEvent<string>('terminal-feedback', {
          detail: 'Input must be a port number.',
        }),
      );
      return false;
    }

    const parsed = Number.parseInt(normalized, 10);
    const isCorrect = parsed === this.vulnerablePort;

    if (isCorrect) {
      this.markSolved();
      return true;
    }

    this.attemptsUsed += 1;
    const attemptsLeft = MAX_ATTEMPTS - this.attemptsUsed;

    if (attemptsLeft <= 0) {
      this.markFailed(`Port scan lockout. Vulnerable port was ${this.vulnerablePort}.`);
      return false;
    }

    this.dispatchEvent(
      new CustomEvent<string>('terminal-feedback', {
        detail: `Incorrect port. Attempts left: ${attemptsLeft}.`,
      }),
    );

    return false;
  }

  getHint(): string {
    const vulnerable = this.ports.find((entry) => entry.vulnerable);
    if (!vulnerable) {
      return 'No hint available.';
    }

    return `Hint: Vulnerable service ${vulnerable.service} is on a low-numbered port ending in ${vulnerable.port % 10}.`;
  }

  getPorts(): PortEntry[] {
    return [...this.ports];
  }

  private buildPorts(): void {
    const count = this.difficulty <= 1 ? 4 : this.difficulty === 2 ? 6 : 8;
    const chosen = this.shuffle([...SERVICE_POOL]).slice(0, count);
    const vulnerableIndex = this.randomInt(0, chosen.length - 1);

    this.ports = chosen.map((service, index) => {
      const portBase = this.randomInt(20, 9000);
      const versionMajor = this.randomInt(0, 4);
      const versionMinor = this.randomInt(0, 9);
      const vulnerable = index === vulnerableIndex;
      const version = vulnerable ? `v${versionMajor}.${versionMinor} (outdated)` : `v${Math.max(versionMajor, 5)}.${versionMinor}`;

      return {
        port: portBase,
        service: service.service,
        version,
        vulnerable,
      };
    });

    const vulnerable = this.ports[vulnerableIndex];
    this.vulnerablePort = vulnerable.port;
    this.clue = `Find the port running an outdated ${vulnerable.service} service.`;
  }

  private shuffle<T>(values: T[]): T[] {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    return values;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
