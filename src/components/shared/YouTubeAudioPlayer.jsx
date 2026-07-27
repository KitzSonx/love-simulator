'use client';
import { useEffect, useRef, useId } from 'react';

export function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function YouTubeAudioPlayer({ url, playing }) {
  const videoId = getYouTubeId(url);
  const playerRef = useRef(null);
  const reactId = useId();
  const containerId = `yt-player-${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;

    // 1. Ensure the script is loaded
    if (!window.YT) {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
    }

    let initialized = false;
    const createPlayer = () => {
      if (!isMounted) return;
      if (initialized) return;
      if (!window.YT || !window.YT.Player) return;
      initialized = true;
      
      try {
        playerRef.current = new window.YT.Player(containerId, {
          videoId: videoId,
          playerVars: {
            autoplay: playing ? 1 : 0,
            controls: 0,
            loop: 1,
            playlist: videoId, // loop requires playlist to be set to the same videoId
            modestbranding: 1,
            rel: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) {
                try { event.target.destroy(); } catch(e) {}
                return;
              }
              event.target.setVolume(40);
              if (playing) {
                event.target.playVideo();
              }
            },
          },
        });
      } catch (err) {
        console.error('Failed to create YT player:', err);
      }
    };

    // If API already loaded, create player immediately
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Hook into the global onYouTubeIframeAPIReady callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) {
          try { previousCallback(); } catch(e) {}
        }
        createPlayer();
      };
    }

    return () => {
      isMounted = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying YT player:', e);
        }
      }
    };
  }, [videoId]);

  // Handle play/pause changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      try {
        if (playing) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn('Error setting YT play state:', e);
      }
    }
  }, [playing]);

  if (!videoId) return null;

  return (
    <div 
      style={{ 
        position: 'absolute', 
        width: 0, 
        height: 0, 
        opacity: 0, 
        pointerEvents: 'none', 
        overflow: 'hidden' 
      }}
    >
      <div id={containerId} />
    </div>
  );
}
