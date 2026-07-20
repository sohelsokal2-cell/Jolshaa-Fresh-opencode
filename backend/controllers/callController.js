const supabase = require('../config/supabaseClient');
const { AccessToken } = require('livekit-server-sdk');

// GET /api/calls/turn-credentials
// Fetches short-lived TURN credentials from Metered.ca
async function getTurnCredentials(req, res) {
  try {
    const apiKey = process.env.METERED_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'CONFIG_ERROR',
        message: 'Metered API key not configured.',
      });
    }

    const meteredSubdomain = process.env.METERED_SUBDOMAIN;
    if (!meteredSubdomain) {
      return res.status(500).json({
        success: false,
        error: 'CONFIG_ERROR',
        message: 'Metered subdomain not configured.',
      });
    }

    const response = await fetch(
      `https://${meteredSubdomain}.metered.live/api/v1/turn/credentials`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      }
    );

    if (!response.ok) {
      console.error('[callController] Metered API error:', response.status);
      return res.status(502).json({
        success: false,
        error: 'TURN_FETCH_FAILED',
        message: 'Failed to fetch TURN credentials.',
      });
    }

    const iceServers = await response.json();

    return res.status(200).json({
      success: true,
      iceServers,
    });
  } catch (err) {
    console.error('[callController] getTurnCredentials error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch TURN credentials.',
    });
  }
}

// POST /api/calls/livekit/token
// Generates a LiveKit access token for group calls
async function getLivekitToken(req, res) {
  try {
    const { roomName } = req.body;

    if (!roomName || typeof roomName !== 'string' || roomName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'roomName is required.',
      });
    }

    const isLiveRoom = roomName.startsWith('live-');
    const isGroupRoom = roomName.startsWith('group-');
    if (!isLiveRoom && !isGroupRoom) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'roomName must identify a group conversation or live stream.',
      });
    }

    const resourceId = roomName.slice(isLiveRoom ? 'live-'.length : 'group-'.length);
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'A conversation ID is required.',
      });
    }

    let canPublish = true;
    if (isGroupRoom) {
      const { data: participant, error: checkError } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', resourceId)
        .eq('user_id', req.user.id)
        .single();

      if (checkError || !participant) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'You are not a member of this group.' });
      }
    } else {
      const { data: stream, error: streamError } = await supabase
        .from('live_streams')
        .select('id, host_id, status')
        // The client sends the public room name. Match that exact value so
        // token generation does not depend on parsing a UUID from the room.
        .eq('room_name', roomName)
        .eq('status', 'live')
        .single();

      if (streamError || !stream) {
        console.error('[callController] Live stream lookup failed:', streamError?.message || 'stream not found', { roomName, resourceId });
        return res.status(404).json({ success: false, error: 'LIVE_NOT_FOUND', message: 'This live stream is no longer active.' });
      }
      canPublish = stream.host_id === req.user.id;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        error: 'CONFIG_ERROR',
        message: 'LiveKit credentials not configured.',
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      // Never trust a client-supplied identity; use the authenticated user.
      identity: req.user.id,
      ttl: '10m',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    });

    const token = await at.toJwt();

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    console.error('[callController] getLivekitToken error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to generate LiveKit token.',
    });
  }
}

module.exports = {
  getTurnCredentials,
  getLivekitToken,
};
