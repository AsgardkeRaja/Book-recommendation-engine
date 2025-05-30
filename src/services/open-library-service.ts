
'use server';

import type { OpenLibrarySearchResult, OpenLibraryDoc } from '@/lib/types';

const BASE_URL = 'https://openlibrary.org/search.json';

interface SearchParams {
  title?: string;
  author?: string;
  genre?: string; // maps to 'subject' in Open Library
  sort?: string; // for sorting results
}

export async function searchOpenLibraryBooks(
  { title, author, genre, sort }: SearchParams,
  limit: number = 12,
  offset: number = 0
): Promise<{ docs: OpenLibraryDoc[]; numFound: number }> {
  const queryParams = new URLSearchParams();
  let hasSearchTerm = false;

  if (title) {
    queryParams.append('title', title);
    hasSearchTerm = true;
  }
  if (author) {
    queryParams.append('author', author);
    hasSearchTerm = true;
  }
  if (genre) {
    // Open Library uses 'subject' for genre-like queries
    queryParams.append('subject', genre);
    hasSearchTerm = true;
  }

  if (!hasSearchTerm) {
    return { docs: [], numFound: 0 };
  }
  
  if (sort) {
    queryParams.append('sort', sort);
  }

  queryParams.append('fields', 'key,title,author_name,first_publish_year,isbn,cover_i,subject,edition_key');
  queryParams.append('limit', String(limit));
  queryParams.append('offset', String(offset));

  const url = `${BASE_URL}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails = response.statusText;
      try {
        const errorData = await response.json();
        errorDetails = errorData?.error || errorData?.message || response.statusText;
      } catch (e) {
        // Ignore if response is not JSON
      }
      console.error('Open Library API error:', response.status, errorDetails.substring(0, 500));
      throw new Error(`Open Library API request failed (${response.status}): ${errorDetails.substring(0,200)}`);
    }
    
    const data: OpenLibrarySearchResult = await response.json();
    return { docs: data.docs || [], numFound: data.numFound || 0 };
  } catch (error) {
    console.error('Failed to fetch books from Open Library API:', error);
    throw error; 
  }
}

