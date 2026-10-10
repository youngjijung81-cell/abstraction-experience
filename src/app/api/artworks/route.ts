import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ artworks: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, student_name, title, emotion, mode, principles, elements_summary, description, image_data } = body;

    if (!student_name || !title || !image_data) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('artworks')
      .insert([
        {
          student_id: student_id || '자유작가',
          student_name,
          title,
          emotion: emotion || '자유',
          mode: mode || 'freeform',
          principles: principles || [],
          elements_summary: elements_summary || '',
          description: description || '',
          image_data
        }
      ])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
