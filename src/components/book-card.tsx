import Image from 'next/image';
import type { OpenLibraryDoc } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CalendarDays, Info, User } from 'lucide-react';

interface BookCardProps {
  book: OpenLibraryDoc;
  index: number;
}

export function BookCard({ book, index }: BookCardProps) {
  const title = book.title;
  const authors = book.author_name?.join(', ') || 'Unknown Author';
  // Take the first few subjects as genres, as there can be many
  const genre = book.subject?.slice(0, 3).join(', ') || 'N/A';
  const publishedDate = book.first_publish_year ? String(book.first_publish_year) : 'N/A';
  
  let coverImage = `https://placehold.co/200x300.png`;
  if (book.cover_i) {
    coverImage = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
  } else if (book.isbn && book.isbn.length > 0) {
    // Fallback to ISBN based cover if cover_i is not available
    coverImage = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
  }

  // Construct info link: Prefer edition link if edition_key exists, otherwise work link
  const infoLink = book.edition_key?.[0] 
    ? `https://openlibrary.org/books/${book.edition_key[0]}` 
    : (book.key ? `https://openlibrary.org${book.key}` : undefined);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in fade-in-0 flex flex-col" style={{animationDelay: `${index * 100}ms`}}>
      <div className="flex flex-col sm:flex-row flex-grow">
        <div className="sm:w-1/3 flex-shrink-0 relative h-60 sm:h-auto">
          <Image
            src={coverImage}
            alt={`Cover of ${title}`}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
            data-ai-hint="book cover"
            onError={(e) => {
              // If OpenLibrary cover fails (e.g. 404), fall back to placeholder
              e.currentTarget.src = `https://placehold.co/200x300.png`;
            }}
          />
        </div>
        <div className="sm:w-2/3 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <User className="h-4 w-4 mr-1" />
              <span>{authors}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                <Badge variant="secondary">{genre}</Badge>
              </div>
              {publishedDate !== 'N/A' && (
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                  <span>First Published: {publishedDate}</span>
                </div>
              )}
              {/* Description is usually not available directly from OpenLibrary search, so it's omitted */}
            </div>
            {infoLink && (
              <a
                href={infoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline mt-auto"
              >
                <Info className="h-4 w-4 mr-1" />
                More Info
              </a>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
