-- ---------------------------------------------------------------------------
-- Remove the journal feature entirely.
--
-- The Journal (private narrative entries + chart screenshots) and the social
-- recap engagement tables it anchored are no longer part of the product. The
-- Trades feature and everything derived from it (Dashboard, Analytics,
-- Calendar, Risk) are unaffected.
--
-- Dropped tables (recap_* cascade from journal_entries via their FKs):
--   public.recap_comments
--   public.recap_likes
--   public.recap_saves
--   public.journal_attachments
--   public.journal_entries
--
-- The storage bucket and its objects are removed as well.
-- ---------------------------------------------------------------------------

-- Storage object policies are attached to storage.objects (not the journals
-- tables), so they must be dropped explicitly before the bucket goes away.
drop policy if exists "journal_attachments_storage_insert" on storage.objects;
drop policy if exists "journal_attachments_storage_select" on storage.objects;
drop policy if exists "journal_attachments_storage_update" on storage.objects;
drop policy if exists "journal_attachments_storage_delete" on storage.objects;

delete from storage.objects where bucket_id = 'journal-attachments';
delete from storage.buckets where id = 'journal-attachments';

-- Cascade drops the recap_* tables that reference journal_entries, along with
-- all indexes, triggers, and row level security policies on them.
drop table if exists public.journal_entries cascade;
drop table if exists public.journal_attachments cascade;
