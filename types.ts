export type UserMode = 'student' | 'worker';

export interface WheelItem {
  id: string;
  label: string;
  type: 'fun' | 'work';
  color: string;
  textColor: string;
  weight: number; // For uneven slice sizes
}

export interface WheelConfig {
  items: WheelItem[];
}
