import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import "../styles/videoPlayer.css";

const VideoPlayer = ({ 
  url, 
  onProgress, 
  onComplete,
  poster 
}) => {
  const plyrRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const options = {
    clickToPlay: true,
    settings: ['captions', 'quality', 'speed', 'loop'],
    controls: [
      'play-large',
      'restart',
      'rewind',
      'play',
      'fast-forward',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'captions',
      'settings',
      'pip',
      'airplay',
      'fullscreen'
    ],
    volume: 1,
    muted: false,
    hideControls: true,
    resetOnEnd: false,
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    seekTime: 10,
    quality: {
      default: 576,
      options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
    },
    speed: {
      selected: 1,
      options: [0.5, 0.75, 1, 1.25, 1.5, 2]
    },
    i18n: {
      restart: 'Redémarrer',
      rewind: 'Reculer de {seektime} secondes',
      play: 'Lecture',
      pause: 'Pause',
      fastForward: 'Avancer de {seektime} secondes',
      seek: 'Chercher',
      played: 'Lu',
      buffered: 'Chargé',
      currentTime: 'Position actuelle',
      duration: 'Durée',
      volume: 'Volume',
      mute: 'Muet',
      unmute: 'Activer le son',
      enableCaptions: 'Activer les sous-titres',
      disableCaptions: 'Désactiver les sous-titres',
      enterFullscreen: 'Plein écran',
      exitFullscreen: 'Quitter le plein écran',
      settings: 'Paramètres',
      speed: 'Vitesse',
      normal: 'Normale',
      quality: 'Qualité',
      loop: 'Boucle',
      start: 'Début',
      end: 'Fin',
      all: 'Tout',
      reset: 'Réinitialiser'
    }
  };

  useEffect(() => {
    if (plyrRef.current && isReady) {
      const player = plyrRef.current.plyr;

      // Restaurer la dernière position
      const savedTime = localStorage.getItem(`video-progress-${url}`);
      if (savedTime) {
        player.currentTime = parseFloat(savedTime);
      }

      // Gérer les événements
      const timeUpdateHandler = () => {
        const progress = (player.currentTime / player.duration) * 100;
        onProgress?.(progress);
        
        if (player.currentTime > 0) {
          localStorage.setItem(`video-progress-${url}`, player.currentTime);
        }
      };

      const endedHandler = () => {
        onComplete?.();
      };

      player.on('timeupdate', timeUpdateHandler);
      player.on('ended', endedHandler);

      return () => {
        player.off('timeupdate', timeUpdateHandler);
        player.off('ended', endedHandler);
      };
    }
  }, [url, isReady, onProgress, onComplete]);

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
      <Plyr
        ref={plyrRef}
        source={{
          type: 'video',
          sources: [{
            src: url,
            type: 'video/mp4',
            size: 576
          }],
          poster: poster
        }}
        options={options}
        onReady={() => setIsReady(true)}
      />
    </div>
  );
};

export default VideoPlayer;
