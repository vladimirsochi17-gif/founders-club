import { createClient } from '@supabase/supabase-js';

const {SUPABASE_URL: url,SUPABASE_SERVICE_ROLE_KEY: secret,SUPABASE_PROJECT_REF: ref} = process.env;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'founders-media';
if (!ref || url !== `https://${ref}.supabase.co` || !secret) throw new Error('Configure the matching Supabase project URL and server-only key in a private env file');
const supabase = createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(20000)})}});
const existing = await supabase.storage.getBucket(bucket);
if (existing.error) {
  if (!['400','404'].includes(String(existing.error.statusCode)) || !/not found/i.test(existing.error.message)) throw new Error('Cannot inspect storage bucket');
  const created = await supabase.storage.createBucket(bucket,{public:false,fileSizeLimit:5*1024*1024,allowedMimeTypes:['image/png','image/jpeg','image/webp','application/zip']});
  if (created.error) throw new Error('Cannot create private storage bucket');
}
const verified = await supabase.storage.getBucket(bucket);
if (verified.error || verified.data.public) throw new Error('Storage bucket must be PRIVATE');
console.log(`Verified private bucket: ${bucket}`);
