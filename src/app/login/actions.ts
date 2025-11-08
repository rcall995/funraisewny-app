// src/app/login/actions.ts

'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return redirect(`/login?message=Could not authenticate user`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect(`/login?message=Could not find user after sign in`);
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const role = profile?.role;

  if (role === 'business') redirect('/merchant');
  else if (role === 'fundraiser') redirect('/campaigns');
  else redirect('/dashboard');
}

// --- FINAL, UPDATED SIGN UP ACTION ---
export async function signUp(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const fullName = String(formData.get('fullName'));
  const role = String(formData.get('role')) || 'supporter';
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // STEP 1: Create the user in the auth.users table
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return redirect(`/login?view=sign_up&message=Could not create user: ${signUpError.message}`);
  }

  if (!signUpData.user) {
      return redirect(`/login?view=sign_up&message=User not found after sign up. Please try again.`);
  }

  // STEP 2: Manually and explicitly insert the profile into the public.profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: signUpData.user.id,
      full_name: fullName,
      role: role
    });

  if (profileError) {
      // This is a critical failure. For now, we'll inform the user.
      // In a real-world scenario, you might want to delete the auth user to allow a clean retry.
      return redirect(`/login?view=sign_up&message=Could not create user profile. Please contact support.`);
  }

  // STEP 3: Success!
  return redirect('/login?message=Success! Check your email to confirm your account.');
}