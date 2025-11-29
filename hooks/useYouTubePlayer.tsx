import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioQuality } from '../types';

interface UseYouTubePlayerProps {
  onStateChange: (state: number) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onError: (error: any) => void;
}

export const useYouTubePlayer = ({ onStateChange, onProgress, onError }: UseYouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  const callbacksRef = useRef({ onStateChange, onProgress, onError });

  useEffect(() => {
    callbacksRef.current = { onStateChange, onProgress, onError };
  }, [onStateChange, onProgress, onError]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      stopProgressPolling();
      if (playerRef.current) {
        try {
            playerRef.current.destroy();
        } catch(e) { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializePlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player('youtube-player-hidden', {
      height: '100%', 
      width: '100%',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'disablekb': 1,
        'origin': window.location.origin,
        'autoplay': 1,
        'cc_load_policy': 0, // Force captions OFF
        'iv_load_policy': 3, // Force annotations OFF
        'fs': 0,
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': (e: any) => handleStateChange(e),
        'onError': (e: any) => callbacksRef.current.onError(e),
      },
    });
  };

  const onPlayerReady = () => {
    setIsReady(true);
  };

  const handleStateChange = (event: any) => {
    callbacksRef.current.onStateChange(event.data);
    
    // 1 = Playing
    if (event.data === 1) {
      startProgressPolling();
    } else {
      stopProgressPolling();
    }
  };

  const startProgressPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        callbacksRef.current.onProgress(current, duration);
      }
    }, 100); // 100ms for smooth lyrics
  };

  const stopProgressPolling = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const loadVideo = useCallback((videoId: string) => {
    if (playerRef.current && isReady) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [isReady]);

  const play = useCallback(() => {
    if (playerRef.current && isReady) playerRef.current.playVideo();
  }, [isReady]);

  const pause = useCallback(() => {
    if (playerRef.current && isReady) playerRef.current.pauseVideo();
  }, [isReady]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current && isReady) playerRef.current.seekTo(seconds, true);
  }, [isReady]);

  const setVolume = useCallback((volume: number) => {
    if (playerRef.current && isReady) playerRef.current.setVolume(volume);
  }, [isReady]);

  const setPlaybackQuality = useCallback((quality: AudioQuality) => {
    if (playerRef.current && isReady && playerRef.current.setPlaybackQuality) {
        // Map abstract quality to YouTube API parameters
        let ytQuality = 'default';
        switch (quality) {
            case 'LOW': ytQuality = 'small'; break; // 240p
            case 'NORMAL': ytQuality = 'medium'; break; // 360p/480p
            case 'HIGH': ytQuality = 'hd720'; break; // 720p+ (Max fidelity)
        }
        playerRef.current.setPlaybackQuality(ytQuality);
    }
  }, [isReady]);

  // New function to retrieve real metadata from the player
  const getVideoData = useCallback(() => {
      if (playerRef.current && isReady && playerRef.current.getVideoData) {
          return playerRef.current.getVideoData();
      }
      return null;
  }, [isReady]);

  const getDuration = useCallback(() => {
      if (playerRef.current && isReady && playerRef.current.getDuration) {
          return playerRef.current.getDuration();
      }
      return 0;
  }, [isReady]);

  return { loadVideo, play, pause, seekTo, setVolume, setPlaybackQuality, getVideoData, getDuration, isReady };
};