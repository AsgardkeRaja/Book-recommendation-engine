
import { BookSearch } from '@/components/book-search';
import { BookRecommenderByDescription } from '@/components/book-recommender-by-description';
import { Separator } from '@/components/ui/separator';
import { Book } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold flex items-center">
            <Book className="mr-3 h-10 w-10" />
            Literary Navigator
          </h1>
          <p className="mt-1 text-lg opacity-90">Discover your next favorite read.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section id="recommendations" aria-labelledby="recommendations-heading">
          <h2 id="recommendations-heading" className="text-3xl font-semibold mb-6 text-center md:text-left">
            Find Books You'll Love
          </h2>
          <BookSearch />
        </section>

        <Separator className="my-12 md:my-16" />

        <section id="description-recommender" aria-labelledby="description-recommender-heading" className="max-w-3xl mx-auto">
           <h2 id="description-recommender-heading" className="text-3xl font-semibold mb-8 text-center">
            Got a Description? Get AI Recommendations!
          </h2>
          <BookRecommenderByDescription />
        </section>
      </main>

      <footer className="py-8 mt-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Literary Navigator. All rights reserved.</p>
          <p className="text-sm mt-1">Powered by open data and AI.</p>
        </div>
      </footer>
    </div>
  );
}
