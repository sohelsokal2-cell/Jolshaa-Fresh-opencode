import React from 'react';

/**
 * Highlights matches of a query string inside a given text.
 * Case-insensitive, returns React node elements.
 * 
 * @param {string} text The full text to search in
 * @param {string} query The query string to highlight
 * @returns {React.ReactNode} React elements with highlighted spans
 */
export function highlightMatch(text, query) {
  if (!query || !text) return text;
  
  // Escape regex special characters
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  
  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="match-hl">{part}</span>
    ) : (
      part
    )
  );
}
