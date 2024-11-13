'use client';

import React, { useRef, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import SimplePeer, { Instance } from 'simple-peer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons';
import { SignalData } from '@/types/types';

const AudioSharing = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'Not Connected' | 'Connecting' | 'Connected'
  >('Not Connected');
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Instance | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const initializedRef = useRef(false);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);

  const SERVER_URL =
    process.env.NEXT_PUBLIC_AUDIO_SERVER_URL || 'http://localhost:5555';

  const TURN_SERVER = process.env.NEXT_PUBLIC_TURN_SERVER || '';
  const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_PASSWORD;

  const cleanupAudio = () => {
    console.log('Cleaning up audio connections...');

    // Stop and cleanup all audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      audioStreamRef.current = null;
    }

    // Destroy peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Stop and remove all audio elements
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
    });
    audioElementsRef.current = [];

    // Reset states
    setIsAudioEnabled(false);
    setConnectionStatus('Not Connected');
    initializedRef.current = false;
  };

  const createPeer = (stream: MediaStream, initiator: boolean) => {
    console.log('Creating peer as initiator:', initiator);
    setConnectionStatus('Connecting');

    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          {
            urls: TURN_SERVER,
            username: TURN_USERNAME,
            credential: TURN_CREDENTIAL,
          },
        ],
      },
    });

    peer.on('signal', (data: SignalData) => {
      console.log('Sending signal data');
      socketRef.current?.emit('signal', data);
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      console.log('Received remote stream');
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audioElementsRef.current.push(audio); // Track audio element for cleanup
      audio
        .play()
        .catch((error) => console.error('Error playing audio:', error));
    });

    peer.on('error', (err: Error) => {
      console.error('Peer connection error:', err);
      cleanupAudio();
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      cleanupAudio();
    });

    peer.on('connect', () => {
      console.log('Peer connection established successfully');
      setConnectionStatus('Connected');
    });

    return peer;
  };

  const initializeSocketAndPeer = () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    socketRef.current = io(SERVER_URL, {
      transports: ['websocket'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      cleanupAudio();
    });

    socketRef.current.on('signal', async (data: SignalData) => {
      console.log('Received signal data');

      if (data.type === 'offer' && !peerRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          stream.getTracks().forEach((track) => {
            track.enabled = false;
          });
          audioStreamRef.current = stream;
          peerRef.current = createPeer(stream, false);
        } catch (error) {
          console.error('Error accessing audio devices:', error);
          cleanupAudio();
        }
      }

      if (peerRef.current) {
        try {
          peerRef.current.signal(data as SimplePeer.SignalData);
        } catch (error) {
          console.error('Error signaling peer:', error);
          cleanupAudio();
        }
      }
    });
  };

  const toggleAudio = async () => {
    initializeSocketAndPeer();

    try {
      if (!audioStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        audioStreamRef.current = stream;
        if (!peerRef.current) {
          peerRef.current = createPeer(stream, true);
        }
        stream.getTracks().forEach((track) => {
          track.enabled = true;
        });
        setIsAudioEnabled(true);
      } else {
        const newEnabledState = !isAudioEnabled;
        audioStreamRef.current.getTracks().forEach((track) => {
          track.enabled = newEnabledState;
        });
        setIsAudioEnabled(newEnabledState);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      cleanupAudio();
    }
  };

  // Cleanup effect when component unmounts
  useEffect(() => {
    // Cleanup function that will run when component unmounts
    return () => {
      console.log('AudioSharing component unmounting, cleaning up...');
      cleanupAudio();
    };
  }, []);

  // Add window unload handler to ensure cleanup even when page closes
  useEffect(() => {
    const handleUnload = () => {
      cleanupAudio();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleAudio}
        className="flex items-center gap-1 rounded bg-green-800 px-2 py-1 font-bold text-white transition duration-300 hover:bg-green-700"
      >
        <FontAwesomeIcon
          icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash}
        />
        {connectionStatus === 'Connected' &&
          (isAudioEnabled ? 'Mute' : 'Unmute')}
        {connectionStatus === 'Not Connected' && 'Connect'}
        {connectionStatus === 'Connecting' && 'Connecting'}
      </button>
    </div>
  );
};

export default AudioSharing;
