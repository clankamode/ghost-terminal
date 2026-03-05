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

export class PortScanPuzzle extends BasePuzzle {
  private ports: PortEntry[] = [];
  private vulnerablePort = 0;
  private clue = '';

  constructor(difficulty: number, rng: () => number = Math.random) {
    super(40 + difficulty * 20, difficulty, rng);
  }

  start(): string {
    this.buildPorts();
    const rows = this.ports
      .map((entry) => `${entry.port}/tcp  ${entry.service}  ${entry.version}`)
      .join('\n');

    return ['Scan result:', rows, `Clue: ${this.clue}`, 'Type the vulnerable port number.'].join('\n');
  }

  solve(input: string): boolean {
    const parsed = Number.parseInt(this.normalizeInput(input), 10);
    const isCorrect = Number.isFinite(parsed) && parsed === this.vulnerablePort;

    if (isCorrect) {
      this.markSolved();
      return true;
    }

    if (!Number.isFinite(parsed)) {
      this.markFailed('Input must be a port number.');
    }

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
}
