/**
 * Returns true if the text contains at least one
 * Devanagari (Hindi) character.
 */
export const containsHindi = (text: string): boolean => {
  return /[\u0900-\u097F]/.test(text);
};