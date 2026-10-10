import { createClient } from '@supabase/supabase-js';
import { ArtworkRecord } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ptrowbvbkivizcgbfxhy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cm93YnZia2l2aXpjZ2JmeGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjE5MzUsImV4cCI6MjEwNzE5NzkzNX0.ZDJx4J4ZaoFA5739Yi7Dy1uit3Tpb5Zrn8nu10SQSxI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchArtworks(): Promise<ArtworkRecord[]> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching artworks:', error);
      return [];
    }

    return (data as ArtworkRecord[]) || [];
  } catch (err) {
    console.error('Unexpected error fetching artworks:', err);
    return [];
  }
}

export async function createArtwork(record: Omit<ArtworkRecord, 'id' | 'created_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .insert([record])
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting artwork:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Unexpected error creating artwork:', err);
    return { success: false, error: err?.message || '알 수 없는 오류' };
  }
}
