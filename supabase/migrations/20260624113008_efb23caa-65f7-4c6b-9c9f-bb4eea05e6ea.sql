
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS trimesters smallint[] NOT NULL DEFAULT ARRAY[1,2,3]::smallint[],
  ADD COLUMN IF NOT EXISTS benefits text[] NOT NULL DEFAULT ARRAY[]::text[];

UPDATE public.products SET benefits = ARRAY['Supports baby''s development','Trusted by moms','Easy daily routine'],
  trimesters = ARRAY[1,2,3]::smallint[]
  WHERE category = 'Vitamins' AND array_length(benefits,1) IS NULL;

UPDATE public.products SET benefits = ARRAY['Comfortable through the bump','Soft, breathable fabric','Grows with you'],
  trimesters = ARRAY[2,3]::smallint[]
  WHERE category = 'Clothing' AND array_length(benefits,1) IS NULL;

UPDATE public.products SET benefits = ARRAY['Helps prevent stretch marks','Deeply nourishing','Pregnancy-safe ingredients'],
  trimesters = ARRAY[2,3]::smallint[]
  WHERE category = 'Skincare' AND array_length(benefits,1) IS NULL;

UPDATE public.products SET benefits = ARRAY['Ready for baby''s arrival','Top-rated essentials','Built to last'],
  trimesters = ARRAY[3]::smallint[]
  WHERE category = 'Baby gear' AND array_length(benefits,1) IS NULL;
