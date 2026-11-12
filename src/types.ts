export interface PasswordHistoryItem {
  id: string;
  password: string;
  timestamp: string;
  length: number;
  strength: 'Weak' | 'Medium' | 'Strong';
  entropy: number;
}

export type ActiveTab = 'generator' | 'python_code' | 'terminal' | 'documentation';
