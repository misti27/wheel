import { WheelItem, UserMode } from './types';

// Default fun activities
export const DEFAULT_FUN_ACTIVITIES = [
  "看视频", "刷小红书", "网购", "玩游戏", 
  "吃零食", "发呆", "睡午觉", "听音乐", 
  "看漫画", "刷抖音", "喝奶茶", "逛街", 
  "看电影", "撸猫", "玩手机", "聊天", 
  "吃夜宵", "赖床"
];

// Synthwave Palette (Muted/Darker version)
export const SYNTH_COLORS = [
  "#4361EE", // Blue
  "#3F37C9", // Indigo
  "#7209B7", // Purple
  "#B5179E", // Grape (Replaces Neon Pink)
  "#4895EF", // Light Blue (Replaces Neon Cyan)
];

export const getRiggedOptions = (mode: UserMode): [string, string] => {
  return mode === 'student' ? ["学习", "背书"] : ["上班", "开会"];
};

// Helper to generate the rigged list dynamically
export const generateWheelItems = (mode: UserMode, funList: string[]): WheelItem[] => {
  const items: WheelItem[] = [];
  const totalItems = 20;
  const riggedOptions = getRiggedOptions(mode);
  
  // Indices for work items (Opposite sides)
  const riggedIndex1 = 0;
  const riggedIndex2 = 10;
  
  // Clean up fun list
  let cleanFunList = funList.filter(s => s.trim().length > 0);
  if (cleanFunList.length === 0) cleanFunList = ["虚无", "空虚"]; 

  let funPointer = 0;

  for (let i = 0; i < totalItems; i++) {
    // Pick color from palette cyclically for ALL items to blend in
    const color = SYNTH_COLORS[i % SYNTH_COLORS.length];
    
    if (i === riggedIndex1) {
      items.push({ 
        id: `rigged-1`, 
        label: riggedOptions[0], 
        type: 'work', 
        color: color, 
        textColor: '#ffffff',
        weight: 0.2 // Very thin slice (Stealth Mode)
      });
    } else if (i === riggedIndex2) {
      items.push({ 
        id: `rigged-2`, 
        label: riggedOptions[1], 
        type: 'work', 
        color: color, 
        textColor: '#ffffff',
        weight: 0.2 // Very thin slice (Stealth Mode)
      });
    } else {
      const label = cleanFunList[funPointer % cleanFunList.length];
      items.push({ 
        id: `fun-${i}`, 
        label, 
        type: 'fun', 
        color: color, // Use same palette
        textColor: '#ffffff', // Uniform text color
        weight: 1.0 // Normal size
      });
      funPointer++;
    }
  }

  return items;
};