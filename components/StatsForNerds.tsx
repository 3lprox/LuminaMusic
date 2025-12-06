
import React, { useEffect, useState } from 'react';
import { Song } from '../types'; // CORRECTED: Path from components/ to root/

interface StatsForNerdsProps {
  currentSong: Song | null;
  volume: number;
  videoMode: boolean;
  primaryColor: string; // Add primaryColor prop
}

const StatsForNerds: React.FC<StatsForNerdsProps> = ({ currentSong, volume, videoMode, primaryColor }) => {
  const [fps, setFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [bandwidth, setBandwidth] = useState(0);
  const [bufferHealth, setBufferHealth] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Offline'>('Excellent');
  const [wifiName, setWifiName] = useState('Lumina_5G_Secure');
  
  // Debug State
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for debug events from Settings Modal
    const handleDebug = (e: any) => {
        setSimulatedError(e.detail);
        if (e.detail === 'BUFFER_DEATH') setBufferHealth(0);
        if (e.detail === 'NETWORK_FAIL') setConnectionStatus('Offline');
        if (e.detail === 'UI_FREEZE_SIM') alert("UI Freeze Simulation: This alert blocks the main thread!");
    };
    window.addEventListener('LUMINA_DEBUG_ERROR', handleDebug);

    // Simulate changing stats
    const interval = setInterval(() => {
        if (simulatedError === 'NETWORK_FAIL') {
            setBandwidth(0);
            return;
        }

        const newFps = Math.floor(Math.random() * 5) + 55; // Sim 60fps
        setFps(newFps);
        setDroppedFrames(prev => prev + (Math.random() > 0.95 ? 1 : 0));
        
        const newBw = Math.floor(Math.random() * 15000) + 5000;
        setBandwidth(newBw);
        
        // Logic for Connection Quality
        if (newBw > 15000) setConnectionStatus('Excellent');
        else if (newBw > 8000) setConnectionStatus('Good');
        else if (newBw > 3000) setConnectionStatus('Fair');
        else setConnectionStatus('Poor');

        if (simulatedError !== 'BUFFER_DEATH') {
            setBufferHealth(prev => {
                const noise = (Math.random() - 0.5) * 2;
                return Math.max(0, Math.min(60, prev + noise + (Math.random() > 0.4 ? 0.5 : -0.2)));
            });
        }
    }, 1000);
    
    // Initial Buffer
    setBufferHealth(20.5);

    return () => {
        clearInterval(interval);
        window.removeEventListener('LUMINA_DEBUG_ERROR', handleDebug);
    };
  }, [simulatedError]);

  if (!currentSong) return null;

  return (
    <div className="fixed top-16 left-4 z-[100] bg-black/90 backdrop-blur-md font-mono text-[10px] sm:text-xs p-3 rounded-lg pointer-events-none select-none max-w-[280px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
         style={{ borderLeft: `3px solid ${primaryColor}` }}>
      
      <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
          <h4 className="font-bold text-white">Stats for Nerds</h4>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{currentSong.id.substring(0,6)}</span>
      </div>

      <div className="flex flex-col gap-0.5 text-white/90">
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Device:</span> 
            <span>Web / Browser (PWA)</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Video ID:</span> 
            <span className="truncate">{currentSong.videoId}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Viewport:</span> 
            <span>{window.innerWidth}x{window.innerHeight} {videoMode ? '[Video]' : '[Audio]'}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Volume:</span> 
            <span>{volume}% / 100% (Norm)</span>
        </div>
        
        <div className="my-1 border-t border-white/10"></div>
        
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Connection:</span> 
            <span style={{ color: connectionStatus === 'Excellent' ? '#4caf50' : connectionStatus === 'Good' ? '#8bc34a' : connectionStatus === 'Offline' ? '#f44336' : '#ffc107' }}>
                {connectionStatus}
            </span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">SSID (Sim):</span> 
            <span>{wifiName}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Bandwidth:</span> 
            <span>{(bandwidth / 1000).toFixed(2)} Mbps</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Buffer:</span> 
            <span>{bufferHealth.toFixed(2)} s</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-2">
            <span className="text-white/50 text-right">Drop/Total:</span> 
            <span>{droppedFrames} / {Math.floor(fps * 60)}</span>
        </div>
        
        {simulatedError && (
             <div className="mt-2 p-1 bg-red-900/50 border border-red-500/50 text-red-200 text-center font-bold">
                 ⚠ {simulatedError} ⚠
             </div>
        )}
      </div>
    </div>
  );
};

export default StatsForNerds;
