import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('notify_emails')
    .upsert({ email: email.toLowerCase() }, { onConflict: 'email' });

  if (error) {
    console.error('Notify signup error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
