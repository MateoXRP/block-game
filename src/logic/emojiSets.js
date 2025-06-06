// src/logic/emojiSets.js

export const emojiSets = [
  ['🧱', '🍀', '❤️', '💎', '🌈', '🎈'],            // classic
  ['🐺', '🐊', '🦀️', '🧙️', '🦜', '☠️'],           // knight game enemies
  ['🍕', '🍔', '🍟', '🌮', '🍗', '🍩'],            // food
  ['🐶', '🐱', '🐸', '🐷', '🐼', '🦊'],             // animals
  ['😀', '🤢', '🥵', '🥶', '😎', '😈'],			//smileys
  ['🚂', '⛵', '✈', '🚕',' 🚒', '🚑'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🥊']              // sports
];

export function getShuffledEmojiSets() {
  return [...emojiSets].sort(() => Math.random() - 0.5);
}

