
import React, { useState } from 'react';
import { AudioQuality, Language } from '../types'; // CORRECTED: Path from components/ to root/
import { getTranslation } from '../utils/i18n'; // CORRECTED: Path from components/ to utils/
import { removeDiscordAuth } from '../utils/storage'; // CORRECTED: Path from components/ to utils/

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioQuality: AudioQuality;
  setAudioQuality: (q: AudioQuality) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  apiKey?: string;
  onUpdateApiKey: (key: string | undefined) => void;
  
  // Dev props
  customJs: string;
  setCustomJs: (js: string) => void;
  customCss: string;
  setCustomCss: (css: string) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  
  // Integration props
  discordWebhook: string;
  setDiscordWebhook: (url: string) => void;
  customEndpoint: string;
  setCustomEndpoint: (url: string) => void;
  forceHttps: boolean;
  setForceHttps: (force: boolean) => void;
  
  // Discord Connection Props
  discordClientId: string;
  setDiscordClientId: (id: string) => void;
  discordAccessToken?: string; // Token received from Discord
  setDiscordAccessToken: (token: string | undefined) => void;
  discordUserId?: string; // User ID received from Discord
  setDiscordUserId: (id: string | undefined) => void;
  discordUsername?: string; // Username received from Discord
  setDiscordUsername: (name: string | undefined) => void;

  onDownloadSource: () => void;
  t: (key: string) => string;
}

type SettingsTab = 'GENERAL' | 'DEV' | 'INTEGRATION';

const predefinedColors = [
    '#D0BCFF', '#FFB4AB', '#FFB4B4', '#FCD8B0', '#E7ED9B', '#B4ECB4', '#B4EDEB', '#B0D8EB',
    '#B4B4FF', '#E8B4FF', '#FFB4D8', '#FFD4B4', '#F4F4B4', '#B4F4B4', '#B4F4D4', '#B4D4F4',
    '#D4B4F4', '#F4B4D4', '#B4B4B4', '#FFFFFF' // Some neutral colors
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, 
  audioQuality, setAudioQuality, 
  language, setLanguage, 
  primaryColor, setPrimaryColor,
  apiKey, onUpdateApiKey,
  customJs, setCustomJs,
  customCss, setCustomCss,
  showStats, setShowStats,
  discordWebhook, setDiscordWebhook,
  customEndpoint, setCustomEndpoint,
  forceHttps, setForceHttps,
  discordClientId, setDiscordClientId,
  discordAccessToken, setDiscordAccessToken, // Unused directly, but passed for state management
  discordUserId, setDiscordUserId,
  discordUsername, setDiscordUsername,
  onDownloadSource,
  t
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  
  if (!isOpen) return null;

  const qualityOptions: { value: AudioQuality; label: string; description: string; icon: string }[] = [
    { value: 'LOW', label: t('lowData'), description: t('lowDataDesc'), icon: 'data_saver_on' },
    { value: 'NORMAL', label: t('normalQuality'), description: t('normalQualityDesc'), icon: 'equalizer' },
    { value: 'HIGH', label: t('highQuality'), description: t('highQualityDesc'), icon: 'high_quality' }
  ];

  const tabs = [
      { id: 'GENERAL', label: t('general'), icon: 'tune' },
      { id: 'DEV', label: t('developer'), icon: 'code' },
      { id: 'INTEGRATION', label: t('integrations'), icon: 'hub' },
  ];

  const handleConnectDiscord = () => {
    if (!discordClientId) {
        alert(t('discordClientIdPlaceholder')); // Basic validation
        return;
    }
    const redirectUri = encodeURIComponent(window.location.origin);
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${discordClientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify`;
    window.location.href = discordAuthUrl;
  };

  const handleDisconnectDiscord = () => {
    if (discordUserId) {
        removeDiscordAuth(discordUserId); // Remove from local storage
    }
    setDiscordAccessToken(undefined); // Clear token
    setDiscordUserId(undefined);     // Clear user ID
    setDiscordUsername(undefined);   // Clear username
  };

  // Simulation handlers for Debug
  const triggerBufferDeath = () => {
      window.dispatchEvent(new CustomEvent('LUMINA_DEBUG_ERROR', { detail: 'BUFFER_DEATH' }));
      onClose();
  };
  const triggerUiFreeze = () => {
      // Simulate by blocking main thread briefly? No, better to just show visual indicator
      window.dispatchEvent(new CustomEvent('LUMINA_DEBUG_ERROR', { detail: 'UI_FREEZE_SIM' }));
      onClose();
  };
  const triggerNetworkFail = () => {
      window.dispatchEvent(new CustomEvent('LUMINA_DEBUG_ERROR', { detail: 'NETWORK_FAIL' }));
      onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh]">
        
        {/* Header - Fixed */}
        <div className="px-6 pt-5 pb-4 flex justify-between items-center bg-[#2B2930] z-10 shrink-0">
            <h2 className="text-xl text-[#E6E0E9] font-medium">{t('settings')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#E6E0E9]">
                <span className="material-symbols-rounded">close</span>
            </button>
        </div>

        {/* Tabs - Fixed */}
        <div className="flex px-4 border-b border-[#49454F] shrink-0 bg-[#2B2930]">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`flex-1 flex flex-col items-center py-3 text-xs font-medium border-b-2 transition-colors gap-1
                        ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-[#CAC4D0] hover:text-[#E6E0E9]'}
                    `}
                >
                    <span className="material-symbols-rounded text-xl">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            
            {activeTab === 'GENERAL' && (
                <>
                    {/* Language */}
                    <div>
                        <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">{t('language')}</h3>
                        <div className="flex bg-[#141218] rounded-xl p-1 border border-[#49454F]">
                            <button onClick={() => setLanguage('EN')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'EN' ? 'bg-primary-container text-primary' : 'text-[#CAC4D0]'}`}>English</button>
                            <button onClick={() => setLanguage('ES')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'ES' ? 'bg-primary-container text-primary' : 'text-[#CAC4D0]'}`}>Español</button>
                        </div>
                    </div>

                    {/* Theme Color */}
                    <div>
                        <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">{t('themeColor')}</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {predefinedColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setPrimaryColor(color)}
                                    className={`w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 active:scale-95 ${primaryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2B2930]' : ''}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>


                    {/* API Key */}
                    <div>
                        <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">{t('youtubeApiKey')}</h3>
                        <input 
                            type="text" value={apiKey || ''} onChange={(e) => onUpdateApiKey(e.target.value || undefined)} placeholder={t('apiKeyPlaceholder')}
                            className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-sm font-mono outline-none focus:border-primary"
                        />
                        <p className="text-[10px] text-[#CAC4D0] mt-1">{t('apiKeyDesc')}</p>
                    </div>

                    {/* Audio Quality */}
                    <div>
                        <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">{t('audioQuality')}</h3>
                        <div className="flex flex-col gap-3">
                            {qualityOptions.map((option) => (
                                <button key={option.value} onClick={() => setAudioQuality(option.value)}
                                    className={`flex items-start gap-4 p-3 rounded-xl border transition-all text-left ${audioQuality === option.value ? 'bg-primary-container border-primary' : 'bg-[#141218] border-transparent'}`}>
                                    <span className={`material-symbols-rounded text-xl mt-1 ${audioQuality === option.value ? 'text-primary' : 'text-[#CAC4D0]'}`}>{option.icon}</span>
                                    <div>
                                        <span className={`text-sm font-medium ${audioQuality === option.value ? 'text-primary' : 'text-[#E6E0E9]'}`}>{option.label}</span>
                                        <p className={`text-[10px] ${audioQuality === option.value ? 'text-on-primary-container' : 'text-[#CAC4D0]'}`}>{option.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Download Source */}
                    <div className="pt-4 border-t border-[#49454F]">
                        <button onClick={onDownloadSource} className="w-full py-3 bg-[#49454F] hover:bg-[#5b5763] rounded-xl text-[#E6E0E9] text-sm font-medium flex items-center justify-center gap-2">
                             <span className="material-symbols-rounded">code</span>
                             {t('downloadSource')}
                        </button>
                    </div>
                </>
            )}

            {activeTab === 'DEV' && (
                <>
                    <div className="flex items-center justify-between p-3 bg-[#1D1B20] rounded-xl border border-[#49454F]">
                         <div>
                             <h3 className="text-sm font-medium text-primary">{t('statsForNerds')}</h3>
                             <p className="text-[10px] text-[#CAC4D0]">Show debug overlay on player</p>
                         </div>
                         <button onClick={() => setShowStats(!showStats)} className={`w-12 h-6 rounded-full transition-colors relative ${showStats ? 'bg-primary' : 'bg-[#49454F]'}`}>
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showStats ? 'left-7 bg-on-primary' : 'left-1'}`} />
                         </button>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-sm font-medium text-error uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-rounded">bug_report</span> Chaos Monkey (Debug)
                         </h3>
                         <div className="grid grid-cols-2 gap-3">
                             <button onClick={triggerBufferDeath} className="p-3 bg-error/10 text-error rounded-xl text-xs font-medium border border-error/20 hover:bg-error/20">
                                 Simulate Buffer Death
                             </button>
                             <button onClick={triggerNetworkFail} className="p-3 bg-error/10 text-error rounded-xl text-xs font-medium border border-error/20 hover:bg-error/20">
                                 Simulate Network Fail
                             </button>
                             <button onClick={triggerUiFreeze} className="p-3 bg-error/10 text-error rounded-xl text-xs font-medium border border-error/20 hover:bg-error/20 col-span-2">
                                 Simulate Interface Freeze
                             </button>
                         </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{t('customCss')}</h3>
                        <textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} placeholder="body { background: red !important; }" className="w-full h-24 bg-[#141218] border border-[#938F99] rounded-[12px] p-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-primary resize-none" />
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{t('customJs')}</h3>
                        <textarea value={customJs} onChange={(e) => setCustomJs(e.target.value)} placeholder="console.log('Injected!');" className="w-full h-24 bg-[#141218] border border-[#938F99] rounded-[12px] p-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-primary resize-none" />
                        <p className="text-[10px] text-error mt-1">{t('warningUseAtOwnRisk')}</p>
                    </div>
                </>
            )}

            {activeTab === 'INTEGRATION' && (
                <>
                    {/* Discord Connection */}
                    <div>
                         <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">{t('discordConnection')}</h3>
                         {discordUserId ? (
                             <div className="flex items-center justify-between bg-primary-container rounded-xl p-3">
                                 <span className="text-sm text-primary">{t('connectedAs')} @{discordUsername}</span>
                                 <button onClick={handleDisconnectDiscord} className="px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-medium">{t('disconnect')}</button>
                             </div>
                         ) : (
                             <>
                                 <input 
                                     type="text" value={discordClientId} onChange={(e) => setDiscordClientId(e.target.value)} placeholder={t('discordClientIdPlaceholder')}
                                     className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 mb-2 text-[#E6E0E9] text-xs font-mono outline-none focus:border-primary"
                                 />
                                 <button onClick={handleConnectDiscord} className="w-full py-3 bg-[#49454F] hover:bg-[#5b5763] rounded-xl text-[#E6E0E9] text-sm font-medium flex items-center justify-center gap-2">
                                    <span className="material-symbols-rounded">discord</span>
                                    {t('connectDiscord')}
                                 </button>
                                 <p className="text-[10px] text-[#CAC4D0] mt-1">{t('discordConnectNote')}</p>
                             </>
                         )}
                         <p className="text-[10px] text-error mt-2">{t('discordDataWarning')}</p>
                    </div>

                    {/* Discord Webhook */}
                    <div>
                         <h3 className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{t('discordWebhook')}</h3>
                         <input type="text" value={discordWebhook} onChange={(e) => setDiscordWebhook(e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-primary" />
                         <p className="text-[10px] text-[#CAC4D0] mt-1">{t('discordWebhookNote')}</p>
                    </div>

                    {/* Custom API Endpoint */}
                    <div>
                         <h3 className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{t('customEndpoint')}</h3>
                         <input type="text" value={customEndpoint} onChange={(e) => setCustomEndpoint(e.target.value)} placeholder="https://api.example.com" className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-primary" />
                    </div>

                    {/* Force HTTPS */}
                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-medium text-primary uppercase tracking-wider">{t('forceHttps')}</h3>
                         <button onClick={() => setForceHttps(!forceHttps)} className={`w-12 h-6 rounded-full transition-colors relative ${forceHttps ? 'bg-primary' : 'bg-[#49454F]'}`}>
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${forceHttps ? 'left-7 bg-on-primary' : 'left-1'}`} />
                         </button>
                    </div>
                </>
            )}

        </div>
        
        {/* Footer - Fixed */}
        <div className="bg-[#1D1B20] p-3 text-center shrink-0 border-t border-[#49454F]">
             <p className="text-[10px] text-[#49454F]">Lumina Music v2.5 • Power User Edition</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
