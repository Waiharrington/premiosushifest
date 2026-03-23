-- Enable storage if not already enabled (usually enabled by default)
-- Create the storage bucket for locales
insert into storage.buckets (id, name, public)
values ('locales', 'locales', true) on conflict (id) do nothing;
-- Policy: Allow public read access to locales bucket
create policy "Public Access" on storage.objects for
select using (bucket_id = 'locales');
-- Policy: Allow authenticated/anon uploads (Depending on your auth setup, you might want to restrict this)
-- Here we allow anyone with the anon key to upload, matching your app's current open nature for testing
create policy "Allow Uploads" on storage.objects for
insert with check (bucket_id = 'locales');