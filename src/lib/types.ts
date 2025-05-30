export interface Book {
  id: string; // Could be ISBN or OpenLibrary ID
  title: string;
  author: string;
  genre: string;
  description?: string; // Or 'reason' from AI
  coverImageUrl?: string;
  mood?: string;
}

// For AI flow outputs
export interface RecommendedBook {
  title: string;
  author: string;
  genre: string;
  mood?: string;
  reason: string;
}

// For Open Library API
export interface OpenLibraryDoc {
  key: string; // Work key or Edition key like "/works/OL45883W" or "/books/OL7353617M"
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number; // Cover ID
  subject?: string[]; // Genres/subjects
  edition_key?: string[]; // Array of OLIDs for editions
  // Note: Full descriptions often require a separate API call to Open Library.
  // Search results might have `first_sentence` or limited snippets.
}

export interface OpenLibrarySearchResult {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibraryDoc[];
  q: string;
  offset: null | number;
}
