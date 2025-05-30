
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { recommendBooksByDescription, RecommendBooksByDescriptionInput, RecommendBooksByDescriptionOutput } from '@/ai/flows/recommend-books-by-description';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Wand2, BookOpenText, User, Tag, Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const recommenderFormSchema = z.object({
  description: z.string().min(20, "Please enter a description of at least 20 characters."),
});

type RecommenderFormValues = z.infer<typeof recommenderFormSchema>;

export function BookRecommenderByDescription() {
  const [recommendations, setRecommendations] = useState<RecommendBooksByDescriptionOutput['recommendations']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecommenderFormValues>({
    resolver: zodResolver(recommenderFormSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: RecommenderFormValues) {
    setIsLoading(true);
    setRecommendations([]);

    try {
      const input: RecommendBooksByDescriptionInput = {
        description: values.description,
      };
      const result = await recommendBooksByDescription(input);
      if (result.recommendations && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
        toast({
          title: "Recommendations Found!",
          description: `Here are ${result.recommendations.length} books you might like.`,
        });
      } else {
        toast({
          title: "No Recommendations",
          description: "We couldn't find any specific recommendations based on that description. Try being more detailed.",
          variant: "default"
        });
      }
    } catch (e) {
      console.error(e);
      let errorMessage = "Failed to get recommendations. Please try again.";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Wand2 className="mr-2 h-5 w-5 text-accent" />
            Analyze Description & Get Recommendations
          </CardTitle>
          <CardDescription>
            Paste a book's description below, and our AI will suggest similar books you might enjoy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter book description here... The more detail, the better!"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                {isLoading ? 'Analyzing & Recommending...' : 'Get Recommendations'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {recommendations.length > 0 && !isLoading && (
        <div className="space-y-6">
           <h3 className="text-2xl font-semibold text-center">AI Recommended Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((book, index) => (
              <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                     <BookOpenText className="mr-2 h-5 w-5 text-primary" />
                    {book.title}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <User className="mr-2 h-4 w-4" /> {book.author}
                  </div>
                  {book.genre && (
                     <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Tag className="mr-1 h-3 w-3" /> {book.genre}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-foreground">{book.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
