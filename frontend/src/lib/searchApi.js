import { supabase } from '../config/supabaseClient';

export async function searchAll(query, limitCount = 10) {
  if (!query || query.trim().length < 2) return [];

  const { data, error } = await supabase
    .rpc('search_all', {
      query: query.trim(),
      limit_count: limitCount
    });

  if (error) throw error;
  return data || [];
}

export async function searchCounts(query) {
  if (!query || query.trim().length < 2) {
    return { all: 0, people: 0, posts: 0, groups: 0, events: 0, pages: 0 };
  }

  const { data, error } = await supabase
    .rpc('search_counts', { query: query.trim() });

  if (error) throw error;

  const counts = { all: 0, people: 0, posts: 0, groups: 0, events: 0, pages: 0 };
  if (data) {
    data.forEach(row => {
      const count = Number(row.count) || 0;
      counts.all += count;
      if (row.result_type === 'user') counts.people = count;
      else if (row.result_type === 'post') counts.posts = count;
      else if (row.result_type === 'group') counts.groups = count;
      else if (row.result_type === 'event') counts.events = count;
      else if (row.result_type === 'page') counts.pages = count;
    });
  }
  return counts;
}

export async function fetchSearchResultDetails(results) {
  if (!results || results.length === 0) return { users: [], posts: [], groups: [], events: [], pages: [] };

  const userIds = results.filter(r => r.result_type === 'user').map(r => r.id);
  const postIds = results.filter(r => r.result_type === 'post').map(r => r.id);
  const groupIds = results.filter(r => r.result_type === 'group').map(r => r.id);
  const eventIds = results.filter(r => r.result_type === 'event').map(r => r.id);
  const pageIds = results.filter(r => r.result_type === 'page').map(r => r.id);

  const [usersData, postsData, groupsData, eventsData, pagesData] = await Promise.all([
    userIds.length > 0
      ? supabase.from('profiles').select('id, name, bio, profile_photo_url, email').in('id', userIds)
      : { data: [], error: null },
    postIds.length > 0
      ? supabase.from('posts').select('id, content, author_id, image_url, created_at, profiles:author_id(name, profile_photo_url)').in('id', postIds)
      : { data: [], error: null },
    groupIds.length > 0
      ? supabase.from('groups').select('id, name, description, cover_image_url, privacy, creator_id').in('id', groupIds)
      : { data: [], error: null },
    eventIds.length > 0
      ? supabase.from('events').select('id, title, description, cover_image_url, category, location_text, event_date, host_id, profiles:host_id(name, profile_photo_url)').in('id', eventIds)
      : { data: [], error: null },
    pageIds.length > 0
      ? supabase.from('pages').select('id, name, category, description, cover_image_url, creator_id').in('id', pageIds)
      : { data: [], error: null }
  ]);

  return {
    users: usersData.data || [],
    posts: (postsData.data || []).map(p => ({
      ...p,
      authorName: p.profiles?.name || null,
      authorAvatar: p.profiles?.profile_photo_url || null,
    })),
    groups: groupsData.data || [],
    events: (eventsData.data || []).map(e => ({
      ...e,
      hostName: e.profiles?.name || null,
      hostAvatar: e.profiles?.profile_photo_url || null,
    })),
    pages: pagesData.data || [],
  };
}
