"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { searchOpenLibraryBooks } from '@/services/open-library-service';
import type { OpenLibraryDoc } from '@/lib/types';
import { BookCard } from './book-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Search, BookHeart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const searchFormSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  genre: z.string().optional(),
}).refine(data => data.title || data.author || data.genre, {
  message: "Please enter at least one search criteria (title, author, or genre).",
  path: ["title"], // You can point to any field or a general form error
});


export function BookSearch() {
  const [searchResults, setSearchResults] = useState<OpenLibraryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
    },
  });

  async function onSubmit(values: z.infer<typeof searchFormSchema>) {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    // No API key check needed for Open Library basic search

    try {
      const results: OpenLibraryDoc[] = await searchOpenLibraryBooks({
        title: values.title,
        author: values.author,
        genre: values.genre, // Maps to 'subject' in Open Library service
      }, 12); // Fetch 12 results

      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        toast({
          title: "No Results",
          description: "We couldn't find any books matching your search. Try different keywords.",
          variant: "default",
        });
      }
    } catch (e) {
      console.error(e); 
      let userFriendlyMessage = "An unknown error occurred while fetching books from Open Library.";
      if (e instanceof Error) {
         userFriendlyMessage = `Failed to fetch books: ${e.message}`;
      }
      setError(userFriendlyMessage);
      toast({
        title: "API Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 bg-card rounded-lg shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="lg:col-span-2">
                  <FormLabel>Book Title (or keyword)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Great Gatsby" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., F. Scott Fitzgerald" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre/Subject (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Classic, Science Fiction" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? 'Searching...' : 'Search Books'}
            </Button>
          </div>
           {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}
          {form.formState.errors.title && !form.formState.errors.title.message?.includes("at least one") && (
             <FormMessage>{form.formState.errors.title.message}</FormMessage>
          )}
           {/* Display a general message if the refine condition fails and it's not assigned to 'title' specifically */}
          {form.formState.errors && Object.values(form.formState.errors).find(err => err.message?.includes("at least one search criteria")) && (
            <p className="text-sm font-medium text-destructive">{Object.values(form.formState.errors).find(err => err.message?.includes("at least one search criteria"))?.message}</p>
          )}
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error Encountered</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(!isLoading && searchResults.length > 0) && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold flex items-center">
              <BookHeart className="mr-2 h-6 w-6 text-primary" />
              Search Results
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book, index) => (
              <BookCard key={book.edition_key?.[0] || book.key || index} book={book} index={index} />
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(6)].map((_, i) => ( 
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <Skeleton className="sm:w-1/3 h-60 sm:h-auto" />
                <div className="sm:w-2/3 p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  {/* <Skeleton className="h-12 w-full" /> Description skeleton removed */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
       {(!isLoading && searchResults.length === 0 && form.formState.isSubmitted && !error) && (
        <p className="text-center text-muted-foreground mt-4">No books found matching your criteria. Please try a different search.</p>
      )}
    </div>
  );
}