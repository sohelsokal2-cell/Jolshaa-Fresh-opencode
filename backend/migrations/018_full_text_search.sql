-- Migration 018: Full-text Search (profiles, posts, groups, events, pages)
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. PROFILES: search_vector column + trigger
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(bio, ''))
    ) STORED;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_search ON public.profiles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.profiles_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.name, '') || ' ' || coalesce(NEW.bio, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_search_vector_trigger ON public.profiles;
CREATE TRIGGER profiles_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, bio ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_search_vector_update();

-- =============================================
-- 2. POSTS: search_vector column + trigger
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.posts ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple', coalesce(content, ''))
    ) STORED;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_search ON public.posts USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.posts_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_trigger ON public.posts;
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE OF content ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.posts_search_vector_update();

-- =============================================
-- 3. GROUPS: search_vector column + trigger
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.groups ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_groups_search ON public.groups USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.groups_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS groups_search_vector_trigger ON public.groups;
CREATE TRIGGER groups_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.groups_search_vector_update();

-- =============================================
-- 4. EVENTS: search_vector column + trigger
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.events ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location_text, ''))
    ) STORED;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_search ON public.events USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.events_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '') || ' ' || coalesce(NEW.location_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_search_vector_trigger ON public.events;
CREATE TRIGGER events_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description, location_text ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.events_search_vector_update();

-- =============================================
-- 5. PAGES: search_vector column + trigger
-- =============================================
DO $$ BEGIN
  ALTER TABLE public.pages ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_pages_search ON public.pages USING GIN(search_vector);

CREATE OR REPLACE FUNCTION public.pages_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pages_search_vector_trigger ON public.pages;
CREATE TRIGGER pages_search_vector_trigger
  BEFORE INSERT OR UPDATE OF name, description ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.pages_search_vector_update();

-- =============================================
-- 6. SEARCH_ALL RPC FUNCTION
-- Returns unified results from all tables with result_type label
-- Each category limited to prevent one type from dominating
-- =============================================
CREATE OR REPLACE FUNCTION public.search_all(
  query text,
  limit_count int DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  result_type text,
  title text,
  subtitle text,
  rank real
)
LANGUAGE sql STABLE
AS $$
  WITH user_results AS (
    SELECT
      p.id,
      'user'::text AS result_type,
      p.name AS title,
      p.bio AS subtitle,
      ts_rank(p.search_vector, plainto_tsquery('simple', query)) AS rank
    FROM public.profiles p
    WHERE p.search_vector @@ plainto_tsquery('simple', query)
      AND p.is_deactivated = false
    ORDER BY rank DESC
    LIMIT limit_count
  ),
  post_results AS (
    SELECT
      po.id,
      'post'::text AS result_type,
      left(coalesce(po.content, ''), 100) AS title,
      NULL::text AS subtitle,
      ts_rank(po.search_vector, plainto_tsquery('simple', query)) AS rank
    FROM public.posts po
    WHERE po.search_vector @@ plainto_tsquery('simple', query)
    ORDER BY rank DESC
    LIMIT limit_count
  ),
  group_results AS (
    SELECT
      g.id,
      'group'::text AS result_type,
      g.name AS title,
      g.description AS subtitle,
      ts_rank(g.search_vector, plainto_tsquery('simple', query)) AS rank
    FROM public.groups g
    WHERE g.search_vector @@ plainto_tsquery('simple', query)
    ORDER BY rank DESC
    LIMIT limit_count
  ),
  event_results AS (
    SELECT
      e.id,
      'event'::text AS result_type,
      e.title AS title,
      e.location_text AS subtitle,
      ts_rank(e.search_vector, plainto_tsquery('simple', query)) AS rank
    FROM public.events e
    WHERE e.search_vector @@ plainto_tsquery('simple', query)
    ORDER BY rank DESC
    LIMIT limit_count
  ),
  page_results AS (
    SELECT
      pg.id,
      'page'::text AS result_type,
      pg.name AS title,
      pg.description AS subtitle,
      ts_rank(pg.search_vector, plainto_tsquery('simple', query)) AS rank
    FROM public.pages pg
    WHERE pg.search_vector @@ plainto_tsquery('simple', query)
    ORDER BY rank DESC
    LIMIT limit_count
  )
  SELECT * FROM user_results
  UNION ALL SELECT * FROM post_results
  UNION ALL SELECT * FROM group_results
  UNION ALL SELECT * FROM event_results
  UNION ALL SELECT * FROM page_results
  ORDER BY rank DESC
  LIMIT limit_count * 5;
$$;

-- =============================================
-- 7. SEARCH_COUNTS RPC: Get count per category
-- =============================================
CREATE OR REPLACE FUNCTION public.search_counts(query text)
RETURNS TABLE(
  result_type text,
  count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT 'user'::text AS result_type, COUNT(*) AS count
  FROM public.profiles p
  WHERE p.search_vector @@ plainto_tsquery('simple', query)
    AND p.is_deactivated = false

  UNION ALL

  SELECT 'post'::text AS result_type, COUNT(*) AS count
  FROM public.posts po
  WHERE po.search_vector @@ plainto_tsquery('simple', query)

  UNION ALL

  SELECT 'group'::text AS result_type, COUNT(*) AS count
  FROM public.groups g
  WHERE g.search_vector @@ plainto_tsquery('simple', query)

  UNION ALL

  SELECT 'event'::text AS result_type, COUNT(*) AS count
  FROM public.events e
  WHERE e.search_vector @@ plainto_tsquery('simple', query)

  UNION ALL

  SELECT 'page'::text AS result_type, COUNT(*) AS count
  FROM public.pages pg
  WHERE pg.search_vector @@ plainto_tsquery('simple', query);
$$;

-- Done!
