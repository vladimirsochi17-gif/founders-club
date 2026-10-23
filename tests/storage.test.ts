import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ upload: vi.fn(), remove: vi.fn(), exists: vi.fn(), download: vi.fn(), createSignedUrl: vi.fn(), getBucket: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({storage: { from: () => api, getBucket: api.getBucket }}) }));
import { createFileStore } from '../server/lib/storage.js';

afterEach(() => vi.resetAllMocks());
const remote = () => createFileStore({provider:'supabase',directory:'unused',url:'https://test.supabase.co',secret:'test-only',bucket:'founders-media'});

describe('private file storage', () => {
  it('preserves local storage, rejects traversal and does not overwrite existing files', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'founders-storage-'));
    try {
      const local = createFileStore({provider:'local',directory,url:'',secret:'',bucket:'unused'});
      await local.put('test.png', Buffer.from('image'), 'image/png');
      expect(await readFile(path.join(directory,'test.png'),'utf8')).toBe('image');
      await expect(local.put('test.png',Buffer.from('overwrite'),'image/png')).rejects.toThrow();
      await expect(local.put('../escape.png',Buffer.from('bad'),'image/png')).rejects.toMatchObject({code:'invalid_storage_key'});
      await local.remove('test.png');
      expect(await local.exists('test.png')).toBe(false);
    } finally { await rm(directory,{recursive:true,force:true}); }
  });
  it('requires a private bucket', async () => {
    api.getBucket.mockResolvedValue({data:{public:true},error:null});
    await expect(remote().verify()).rejects.toThrow('PRIVATE');
    api.getBucket.mockResolvedValue({data:{public:false},error:null});
    await expect(remote().verify()).resolves.toBeUndefined();
  });
  it('uploads without overwrite and enforces the post-processing size limit', async () => {
    api.upload.mockResolvedValue({error:null});
    await remote().put('test.png',Buffer.from('image'),'image/png');
    expect(api.upload).toHaveBeenCalledWith('test.png',expect.any(Buffer),{contentType:'image/png',upsert:false,cacheControl:'0'});
    await expect(remote().put('big.png',Buffer.alloc(5*1024*1024+1),'image/png')).rejects.toMatchObject({status:413});
  });
  it('never exposes provider errors or secrets to visitors', async () => {
    api.upload.mockResolvedValue({error:{message:'secret provider response'}});
    await expect(remote().put('test.png',Buffer.from('image'),'image/png')).rejects.toMatchObject({code:'storage_unavailable',message:'Хранилище файлов временно недоступно.'});
  });
  it('proxies private image bytes without making objects public', async () => {
    api.download.mockResolvedValue({data:new Blob(['image']),error:null});
    const response = {send:vi.fn()};
    await remote().send('test.png', response as never);
    expect(response.send).toHaveBeenCalledWith(Buffer.from('image'));
    expect(api.createSignedUrl).not.toHaveBeenCalled();
  });
  it('uses short-lived links for authorized resource downloads', async () => {
    api.createSignedUrl.mockResolvedValue({data:{signedUrl:'https://test.supabase.co/signed'},error:null});
    const response = {redirect:vi.fn()};
    await remote().send('kit.zip',response as never,true);
    expect(api.createSignedUrl).toHaveBeenCalledWith('kit.zip',60,{download:'kit.zip'});
    expect(response.redirect).toHaveBeenCalledWith(302,'https://test.supabase.co/signed');
  });
});
