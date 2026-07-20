import { supabase } from '../config/supabaseClient';

export async function updateProfileField(userId, field, value) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ [field]: value })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmail(newEmail) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) throw error;

  // Sync email to profiles table (auth email is primary, profiles is display)
  const user = data?.user;
  if (user) {
    await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', user.id);
  }

  return data;
}

export async function reauthenticate(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

export async function updateToggle(userId, field, value) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ [field]: value })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updatePostPrivacy(userId, value) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ default_post_privacy: value })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateLanguagePreference(userId, language) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ preferred_language: language })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateAccount(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_deactivated: true })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

// Real deletion via backend (uses service_role key to delete auth user)
export async function requestAccountDeletion() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch('/api/auth/delete-account', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete account');
  }

  // Sign out locally after successful deletion
  await supabase.auth.signOut();
  return result;
}
