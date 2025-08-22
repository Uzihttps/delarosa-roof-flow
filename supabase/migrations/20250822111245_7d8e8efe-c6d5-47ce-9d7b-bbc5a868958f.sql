-- Create video_reviews table
CREATE TABLE public.video_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'expired')),
  review_link TEXT,
  video_url TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_imports table
CREATE TABLE public.client_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  import_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_records INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  import_type TEXT NOT NULL CHECK (import_type IN ('leads', 'customers', 'projects')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_imports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video_reviews
CREATE POLICY "Users can view their own video reviews" 
ON public.video_reviews 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video reviews" 
ON public.video_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video reviews" 
ON public.video_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video reviews" 
ON public.video_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for client_imports
CREATE POLICY "Users can view their own client imports" 
ON public.client_imports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client imports" 
ON public.client_imports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client imports" 
ON public.client_imports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client imports" 
ON public.client_imports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_video_reviews_updated_at
    BEFORE UPDATE ON public.video_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_imports_updated_at
    BEFORE UPDATE ON public.client_imports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();