import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TanzanianBranding = {
  colors: {
    gold: '#FCD34D',
    green: '#10B981',
    blue: '#3B82F6',
    cream: '#FDF5E6',
    brown: '#8B4513',
    black: '#000000',
  },
  text: {
    republic: 'JAMHURI YA MUUNGANO WA TANZANIA',
    office: 'OFISI YA RAIS - TAMISEMI',
  }
};
