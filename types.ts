
export type AppTab = 'menu' | 'assistant' | 'calendar' | 'about' | 'settings';
export type Language = 'fa' | 'en';
export type Theme = 'light' | 'dark';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'finished';
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  text: string;
  type: 'short-term' | 'long-term';
  reached: boolean;
}

export interface Routine {
  id: string;
  text: string;
  completed: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AppSettings {
  language: Language;
  theme: Theme;
  notifications: boolean;
}
