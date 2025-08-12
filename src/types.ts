
export type Mood = 'happy' | 'neutral' | 'sad' | 'scary' | 'mystic';

export interface DreamEntry {
  id: string;
  title: string;
  text: string;
  date: string; // ISO string
  mood: Mood;
  tags: string[];
  location?: { lat: number; lng: number; address?: string };
}
