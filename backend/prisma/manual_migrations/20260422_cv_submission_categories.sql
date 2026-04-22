-- Add candidate-selected categories to CV submissions
ALTER TABLE cv_submissions
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
