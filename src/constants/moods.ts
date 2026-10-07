export type MoodId = 'great' | 'good' | 'okay' | 'low' | 'very-low';

export type Mood = {
  id: MoodId;
  emoji: string;
  label: string;
  value: number; // 1 (worst) to 5 (best), used for the chart
  color: string;
};

export const MOODS: Mood[] = [
  { id: 'great', emoji: '😄', label: 'Great', value: 5, color: '#4FA7A0' },
  { id: 'good', emoji: '🙂', label: 'Good', value: 4, color: '#6CC3BB' },
  { id: 'okay', emoji: '😐', label: 'Okay', value: 3, color: '#D9A441' },
  { id: 'low', emoji: '😟', label: 'Low', value: 2, color: '#E58A3B' },
  { id: 'very-low', emoji: '😢', label: 'Very low', value: 1, color: '#C94B55' },
];

export function getMood(id?: string): Mood | undefined {
  return MOODS.find((m) => m.id === id);
}