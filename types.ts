export interface Topic {
  id: string;
  title: string;
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum AppState {
  HOME = 'HOME',
  TOPIC_VIEW = 'TOPIC_VIEW',
  QUIZ = 'QUIZ',
  SEARCH = 'SEARCH'
}

export const NTSA_TOPICS: Topic[] = [
  { id: 'intro', title: 'Introduction to Driving', icon: '🚗' },
  { id: 'rules', title: 'Fundamental Driving Rules', icon: '📜' },
  { id: 'modeltown', title: 'Model Town', icon: '🏙️' },
  { id: 'human', title: 'Human Factors', icon: '🧠' },
  { id: 'controls', title: 'Vehicle Construction & Controls', icon: '⚙️' },
  { id: 'inspection', title: 'Self-Inspection', icon: '🔍' },
  { id: 'observation', title: 'Observation', icon: '👀' },
  { id: 'control', title: 'Vehicle Control', icon: '🎮' },
  { id: 'comm', title: 'Communication', icon: '📡' },
  { id: 'speed', title: 'Speed Management', icon: '🚀' },
  { id: 'space', title: 'Space Management', icon: '↔️' },
  { id: 'emergency', title: 'Emergency Manoeuvres', icon: '⚠️' },
  { id: 'skid', title: 'Skid Control', icon: '❄️' },
  { id: 'adverse', title: 'Adverse Conditions', icon: '🌧️' },
  { id: 'maintenance', title: 'Preventive Maintenance', icon: '🔧' },
  { id: 'signs', title: 'Traffic Signs', icon: '🛑' },
  { id: 'exam', title: 'The Examination', icon: '📝' },
];