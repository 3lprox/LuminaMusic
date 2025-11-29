
import React, { useEffect, useState } from 'react';
import { Song } from '../types';

interface StatsForNerdsProps {
  currentSong: Song | null;
  volume: number;
  videoMode: boolean;
}

const StatsForNerds: React.FC<StatsForNerdsProps> = ({ currentSong, volume, videoMode }) => {
  const [fps, setFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);

  useEffect(() => {
    // Simulate changing stats
    const interval = setInterval(() => {
        setFps(Math.floor(Math.random() * 5) + 28); // Sim 30fps
        setDroppedFrames(prev => prev + (Math.random() > 0.9 ? 1 : 0));
        setBandwidth(Math.floor(Math.random() * 5000) + 15000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentSong) return null;

  return (
    <div className="fixed top-20 left-4 z-50 bg-black/80 text-[#00FF00] font-mono text-xs p-4 rounded-lg pointer-events-none select-none max-w-xs overflow-hidden border border-[#00FF00]/30 shadow-2xl">
      <h4 className="font-bold underline mb-2">Stats for Nerds</h4>
      <div className="flex flex-col gap-1">
        <p><span className="text-[#00FF00]/70">Video ID:</span> {currentSong.videoId} / {currentSong.id}</p>
        <p><span className="text-[#00FF00]/70">Viewport:</span> {window.innerWidth}x{window.innerHeight} {videoMode ? '(Video)' : '(Hidden)'}</p>
        <p><span className="text-[#00FF00]/70">Volume:</span> {volume}% / 100% (Normalized)</p>
        <p><span className="text-[#00FF00]/70">Buffer Health:</span> {(Math.random() * 20 + 10).toFixed(2)} s</p>
        <p><span className="text-[#00FF00]/70">Network Activity:</span> {bandwidth} Kbps</p>
        <p><span className="text-[#00FF00]/70">Dropped Frames:</span> {droppedFrames}</p>
        <p><span className="text-[#00FF00]/70">Mystery Text:</span> s:4 t:0.00 b:0.000</p>
        <p><span className="text-[#00FF00]/70">Codecs:</span> vp09.00.51.08.01.01.01.01 (299) / opus (251)</p>
        <p><span className="text-[#00FF00]/70">Color:</span> {currentSong.colorHex || 'N/A'}</p>
      </div>
    </div>
  );
};

export default StatsForNerds;
