import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchTurnCredentials,
  createSignalingChannel,
  subscribeToAllSignaling,
  sendSignalingMessage,
} from '../lib/callApi';

// Connection states
export const CALL_STATE = {
  IDLE: 'idle',
  GETTING_MEDIA: 'getting_media',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed',
  ENDED: 'ended',
};

export default function useWebRTCCall({ callId, localUserId, isInitiator, onCallEnd }) {
  const [callState, setCallState] = useState(CALL_STATE.IDLE);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef(null);
  const signalingChannelRef = useRef(null);
  const localStreamRef = useRef(null);
  const cleanupDoneRef = useRef(false);

  // Initialize call
  useEffect(() => {
    if (!callId || !localUserId) return;

    let cancelled = false;

    async function initCall() {
      try {
        setCallState(CALL_STATE.GETTING_MEDIA);

        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Fetch TURN credentials
        const iceServers = await fetchTurnCredentials();

        if (cancelled) return;

        // Create RTCPeerConnection
        const pc = new RTCPeerConnection({ iceServers });

        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignalingMessage(
              signalingChannelRef.current,
              'ice-candidate',
              {
                candidate: event.candidate.toJSON(),
                fromUserId: localUserId,
              }
            );
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          if (cancelled) return;
          switch (pc.connectionState) {
            case 'connected':
              setCallState(CALL_STATE.CONNECTED);
              break;
            case 'disconnected':
              setCallState(CALL_STATE.DISCONNECTED);
              break;
            case 'failed':
              setCallState(CALL_STATE.FAILED);
              break;
            case 'closed':
              setCallState(CALL_STATE.ENDED);
              break;
            default:
              break;
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (cancelled) return;
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setCallState(CALL_STATE.CONNECTED);
          }
        };

        // Set up signaling channel
        const channel = createSignalingChannel(callId);
        signalingChannelRef.current = channel;

        // Subscribe to signaling events
        subscribeToAllSignaling(channel, {
          'offer': async (payload) => {
            if (pc.signalingState !== 'stable') return;
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendSignalingMessage(channel, 'answer', {
                sdp: pc.localDescription.toJSON(),
                fromUserId: localUserId,
              });
            } catch (err) {
              console.error('[useWebRTCCall] Error handling offer:', err);
            }
          },
          'answer': async (payload) => {
            if (pc.signalingState !== 'have-local-offer') return;
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            } catch (err) {
              console.error('[useWebRTCCall] Error handling answer:', err);
            }
          },
          'ice-candidate': async (payload) => {
            try {
              if (payload.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
              }
            } catch (err) {
              console.error('[useWebRTCCall] Error handling ICE candidate:', err);
            }
          },
        });

        // Subscribe to channel with timeout and error handling
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Signaling channel subscription timed out'));
          }, 10000);

          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              clearTimeout(timeout);
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timeout);
              reject(new Error(`Signaling channel failed: ${status}`));
            }
          });
        });

        if (cancelled) return;

        setCallState(CALL_STATE.CONNECTING);

        // If initiator, create and send offer
        if (isInitiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignalingMessage(channel, 'offer', {
            sdp: pc.localDescription.toJSON(),
            fromUserId: localUserId,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useWebRTCCall] Init error:', err);
          setCallState(CALL_STATE.FAILED);
        }
      }
    }

    initCall();

    return () => {
      cancelled = true;
    };
  }, [callId, localUserId, isInitiator]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // End call
  const endCall = useCallback(() => {
    if (cleanupDoneRef.current) return;
    cleanupDoneRef.current = true;

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Remove signaling channel
    if (signalingChannelRef.current) {
      signalingChannelRef.current.unsubscribe();
      signalingChannelRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);

    // Call onCallEnd first to trigger unmount of ActiveCallScreen
    // before setting state on the (about-to-be-unmounted) hook
    if (onCallEnd) onCallEnd();

    // Set state after onCallEnd to avoid setState on unmounted component
    setCallState(CALL_STATE.ENDED);
  }, [onCallEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupDoneRef.current) return;
      cleanupDoneRef.current = true;

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (signalingChannelRef.current) {
        signalingChannelRef.current.unsubscribe();
        signalingChannelRef.current = null;
      }
    };
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    endCall,
  };
}
