
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { searchOpenLibraryBooks } from '@/services/open-library-service';
import type { OpenLibraryDoc } from '@/lib/types';
import { BookCard } from './book-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Search, BookHeart, Loader2, ArrowUpDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const searchFormSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  genre: z.string().optional(),
  sort: z.string().optional(),
}).refine(data => data.title || data.author || data.genre, {
  message: "Please enter at least one search criteria (title, author, or genre).",
  path: ["title"], 
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

const RESULTS_PER_PAGE = 12;

export function BookSearch() {
  const [searchResults, setSearchResults] = useState<OpenLibraryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numFound, setNumFound] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<SearchFormValues | null>(null);
  const { toast } = useToast();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      sort: "relevance", // Default to "relevance"
    },
  });

  const watchedSort = form.watch("sort");

  useEffect(() => {
    if (currentSearchQuery && watchedSort !== currentSearchQuery.sort) {
      const formData = form.getValues();
      onSubmit({
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        sort: watchedSort
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSort]);

  async function onSubmit(values: SearchFormValues) {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setNumFound(0);
    setCurrentOffset(0);
    setCurrentSearchQuery(values);

    const sortForApi = values.sort === "relevance" ? "" : values.sort;

    try {
      const response = await searchOpenLibraryBooks({
        title: values.title,
        author: values.author,
        genre: values.genre,
        sort: sortForApi,
      }, RESULTS_PER_PAGE, 0);

      if (response.docs && response.docs.length > 0) {
        setSearchResults(response.docs);
        setNumFound(response.numFound);
        setCurrentOffset(response.docs.length);
      } else {
        setSearchResults([]);
        setNumFound(0);
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
         if (e.message.includes("(403)")) {
            userFriendlyMessage = "Access to the book service is currently forbidden. Please check API key or service permissions.";
         }
         if (e.message.toLowerCase().includes("cannot determine user location")) {
            userFriendlyMessage = "Book service access failed due to geographic restrictions. Please check your API key's settings in the Google Cloud Console.";
         }
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

  async function handleLoadMore() {
    if (!currentSearchQuery || isLoadingMore || searchResults.length >= numFound) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    const sortForApi = currentSearchQuery.sort === "relevance" ? "" : currentSearchQuery.sort;

    try {
      const response = await searchOpenLibraryBooks(
        {
          title: currentSearchQuery.title,
          author: currentSearchQuery.author,
          genre: currentSearchQuery.genre,
          sort: sortForApi,
        },
        RESULTS_PER_PAGE,
        currentOffset
      );

      if (response.docs && response.docs.length > 0) {
        setSearchResults(prevResults => [...prevResults, ...response.docs]);
        setCurrentOffset(prevOffset => prevOffset + response.docs.length);
      } else {
        toast({
            title: "No More Results",
            description: "It seems there are no more books to load for this search.",
            variant: "default",
        });
      }
    } catch (e) {
      console.error(e);
      let userFriendlyMessage = "An error occurred while fetching more books.";
      if (e instanceof Error) {
        userFriendlyMessage = `Failed to fetch more books: ${e.message}`;
      }
      setError(userFriendlyMessage); 
      toast({
        title: "Load More Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }

  const canLoadMore = searchResults.length > 0 && searchResults.length < numFound && !isLoading;


  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 bg-card rounded-lg shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
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
                  <FormLabel>Author</FormLabel>
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
                  <FormLabel>Genre/Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Classic, Science Fiction" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mt-4">
            <FormField
              control={form.control}
              name="sort"
              render={({ field }) => (
                <FormItem className="w-full md:w-auto md:min-w-[200px]">
                  <FormLabel>Sort by</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <ArrowUpDown className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="title">Title (A-Z)</SelectItem>
                      <SelectItem value="new">Newest First</SelectItem>
                      <SelectItem value="old">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto flex-shrink-0">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isLoading ? 'Searching...' : 'Search Books'}
            </Button>
          </div>
           {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
          )}
          {form.formState.errors.title && !form.formState.errors.title.message?.includes("at least one") && (
             <FormMessage>{form.formState.errors.title.message}</FormMessage>
          )}
          {form.formState.errors && Object.values(form.formState.errors).find(err => err.message?.includes("at least one search criteria")) && (
            <p className="text-sm font-medium text-destructive">{Object.values(form.formState.errors).find(err => err.message?.includes("at least one search criteria"))?.message}</p>
          )}
        </form>
      </Form>

      {error && !isLoadingMore && ( 
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
              Search Results ({searchResults.length} of {numFound})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((book, index) => (
              <BookCard key={book.edition_key?.[0] || book.key || `${book.title}-${index}`} book={book} index={index} />
            ))}
          </div>
          {canLoadMore && (
            <div className="mt-8 text-center">
              <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline">
                {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoadingMore ? 'Loading More...' : 'Load More Results'}
              </Button>
            </div>
          )}
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
       {(!isLoading && searchResults.length === 0 && form.formState.isSubmitted && !error && !isLoadingMore) && (
        <p className="text-center text-muted-foreground mt-4">No books found matching your criteria. Please try a different search.</p>
      )}
    </div>
  );
}

