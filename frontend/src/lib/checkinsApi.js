import { supabase } from '../config/supabaseClient';

export async function fetchCheckIns(userId) {
  const { data, error } = await supabase.from('check_ins').select('*').eq('user_id', userId).order('visited_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCheckIn(userId, locationName, locationArea, visitedDate) {
  const { data, error } = await supabase.from('check_ins').insert({
    user_id: userId, location_name: locationName.trim(), location_area: locationArea?.trim() || null, visited_at: visitedDate || new Date().toISOString().slice(0, 10),
  }).select('*').single();
  if (error) throw error;
  return data;
}
