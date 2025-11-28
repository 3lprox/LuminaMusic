import { useEffect, useRef, useState, useCallback } from 'react';

interface UseYouTubePlayerProps {
  onStateChange: (state: number) => void;
  onProgress: (currentTime: number, duration: number) => void;
  onError: (error: any) => void;
}

export const useYouTubePlayer = ({ onStateChange, onProgress, onError }: UseYouTubePlayerProps) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<number | null>(null);

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
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializePlayer = () => {
    if (playerRef.current) return; // Already initialized

    playerRef.current = new window.YT.Player('youtube-player-hidden', {
      height: '0',
      width: '0',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'disablekb': 1,
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onError,
      },
    });
  };

  const onPlayerReady = () => {
    setIsReady(true);
  };

  const onPlayerStateChange = (event: any) => {
    onStateChange(event.data);
    
    // Start polling for progress if playing (state 1)
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
        onProgress(current, duration);
      }
    }, 1000);
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

  return { loadVideo, play, pause, seekTo, setVolume, isReady };
};