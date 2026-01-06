
export interface Student {
  id: string;
  name: string;
}

export enum Level {
  ELEMENTARY = 'Tiểu học',
  MIDDLE = 'THCS',
  HIGH = 'THPT'
}

export interface GameState {
  students: Student[];
  selectedStudent: Student | null;
  history: Student[];
  isSpinning: boolean;
  level: Level;
  subject: string;
}
