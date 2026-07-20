import { supabase } from '../config/supabaseClient';

// ─── Submit or update a factcheck vote (upsert) ───
// Uses Supabase upsert: if (post_id, voter_id) exists → update, else → insert
export async function submitVote(postId, voterId, vote, reason = null) {
  const { data, error } = await supabase
    .from('factcheck_votes')
    .upsert(
      { post_id: postId, voter_id: voterId, vote, reason: reason || null },
      { onConflict: 'post_id,voter_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Get aggregate vote summary for a post (RPC) ───
// Returns array of [{ vote_type, vote_count }, ...]
// Aggregated via SECURITY DEFINER function — no raw row exposure
export async function getFactCheckSummary(postId) {
  const { data, error } = await supabase
    .rpc('get_fact_check_summary', { p_post_id: postId });

  if (error) throw error;

  // Convert array to object with counts and percentages
  const dist = { true_count: 0, false_count: 0, mislead_count: 0, total: 0 };
  (data || []).forEach(row => {
    dist[row.vote_type + '_count'] = row.vote_count;
    dist.total += row.vote_count;
  });

  // Calculate percentages
  if (dist.total > 0) {
    dist.pct_true = Math.round((dist.true_count / dist.total) * 100);
    dist.pct_false = Math.round((dist.false_count / dist.total) * 100);
    dist.pct_mislead = 100 - dist.pct_true - dist.pct_false;
  } else {
    dist.pct_true = 0;
    dist.pct_false = 0;
    dist.pct_mislead = 0;
  }

  return dist;
}

// ─── Get current user's own vote for a post (RPC) ───
// SECURITY DEFINER: voter can read their own row via function, bypassing RLS
export async function getMyVote(postId, voterId) {
  if (!voterId) return null;

  const { data, error } = await supabase
    .rpc('get_my_factcheck_vote', { p_post_id: postId, p_voter_id: voterId })
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ─── Enable fact-check on a post (flag it for community review) ───
export async function enableFactCheck(postId) {
  const { data, error } = await supabase
    .from('posts')
    .update({ is_fact_check_enabled: true })
    .eq('id', postId)
    .select('id, is_fact_check_enabled')
    .single();

  if (error) throw error;
  return data;
}

// ─── Fetch flagged posts for admin queue ───
export async function fetchFlaggedPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content, image_url, created_at, factcheck_status, factcheck_flagged, admin_note,
      author:profiles!posts_author_id_fkey(name, profile_photo_url)
    `)
    .eq('factcheck_flagged', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch vote distribution for all flagged posts in batch
  const postIds = data.map(p => p.id);
  const summaries = await Promise.all(
    postIds.map(id => getFactCheckSummary(id))
  );

  const results = data.map((post, idx) => {
    const dist = summaries[idx];
    return {
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      factcheck_status: post.factcheck_status,
      admin_note: post.admin_note || '',
      authorName: post.author?.name || 'অজানা',
      authorAvatar: post.author?.profile_photo_url || null,
      trueCount: Number(dist.true_count),
      falseCount: Number(dist.false_count),
      misleadCount: Number(dist.mislead_count),
      totalCount: Number(dist.total),
      pctTrue: Number(dist.pct_true),
      pctFalse: Number(dist.pct_false),
      pctMislead: Number(dist.pct_mislead),
    };
  });

  return results;
}

// ─── Set admin verdict on a post ───
// Admin-only: updates factcheck_status + clears flag + persists admin note
export async function setAdminVerdict(postId, verdict, adminNote = null) {
  const { data, error } = await supabase
    .from('posts')
    .update({
      factcheck_status: verdict,
      factcheck_flagged: false,
      admin_note: adminNote || null,
    })
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Subscribe to vote changes for a post (Realtime) ───
export function subscribeToVoteChanges(postId, onVoteUpdate) {
  const channel = supabase
    .channel(`factcheck-votes-${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'factcheck_votes',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => {
        onVoteUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
