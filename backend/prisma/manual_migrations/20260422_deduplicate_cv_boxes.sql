-- Remove duplicate CV boxes per company — keep the oldest (lowest id) per company.
-- Run this once in the Supabase SQL editor.
DELETE FROM company_boxes
WHERE id NOT IN (
  SELECT MIN(id)
  FROM company_boxes
  GROUP BY company_id
);
