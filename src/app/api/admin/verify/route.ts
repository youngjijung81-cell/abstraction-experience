import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD || '1234';
    if (!password || password.trim() !== expectedPassword) {
      return NextResponse.json(
        { error: '선생님 관리 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
