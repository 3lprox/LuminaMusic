
import React, { useState } from 'react';
import { AudioQuality, Language } from '../types';
import { getTranslation } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioQuality: AudioQuality;
  setAudioQuality: (q: AudioQuality) => void;
  language: Language;
  setLanguage: (l: Language) => void;
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
  
  onDownloadSource: () => void;
}

type SettingsTab = 'GENERAL' | 'DEV' | 'INTEGRATION';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, 
  audioQuality, setAudioQuality, 
  language, setLanguage, 
  apiKey, onUpdateApiKey,
  customJs, setCustomJs,
  customCss, setCustomCss,
  showStats, setShowStats,
  discordWebhook, setDiscordWebhook,
  customEndpoint, setCustomEndpoint,
  forceHttps, setForceHttps,
  onDownloadSource
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
  
  if (!isOpen) return null;

  const t = (key: any) => getTranslation(language, key);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[80vh] sm:h-auto">
        
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
            <h2 className="text-xl text-[#E6E0E9]">{t('settings')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#E6E0E9]">
                <span className="material-symbols-rounded">close</span>
            </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-[#49454F]">
            {tabs.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`flex-1 flex flex-col items-center py-3 text-xs font-medium border-b-2 transition-colors gap-1
                        ${activeTab === tab.id ? 'border-[#D0BCFF] text-[#D0BCFF]' : 'border-transparent text-[#CAC4D0] hover:text-[#E6E0E9]'}
                    `}
                >
                    <span className="material-symbols-rounded text-xl">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {activeTab === 'GENERAL' && (
                <>
                    {/* Language */}
                    <div>
                        <h3 className="text-sm font-medium text-[#D0BCFF] mb-3 uppercase tracking-wider">{t('language')}</h3>
                        <div className="flex bg-[#141218] rounded-xl p-1 border border-[#49454F]">
                            <button onClick={() => setLanguage('EN')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'EN' ? 'bg-[#381E72] text-[#D0BCFF]' : 'text-[#CAC4D0]'}`}>English</button>
                            <button onClick={() => setLanguage('ES')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'ES' ? 'bg-[#381E72] text-[#D0BCFF]' : 'text-[#CAC4D0]'}`}>Español</button>
                        </div>
                    </div>

                    {/* API Key */}
                    <div>
                        <h3 className="text-sm font-medium text-[#D0BCFF] mb-3 uppercase tracking-wider">{t('youtubeApiKey')}</h3>
                        <input 
                            type="text" value={apiKey || ''} onChange={(e) => onUpdateApiKey(e.target.value || undefined)} placeholder={t('apiKeyPlaceholder')}
                            className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-sm font-mono outline-none focus:border-[#D0BCFF]"
                        />
                        <p className="text-[10px] text-[#CAC4D0] mt-1">{t('apiKeyDesc')}</p>
                    </div>

                    {/* Audio Quality */}
                    <div>
                        <h3 className="text-sm font-medium text-[#D0BCFF] mb-3 uppercase tracking-wider">{t('audioQuality')}</h3>
                        <div className="flex flex-col gap-3">
                            {qualityOptions.map((option) => (
                                <button key={option.value} onClick={() => setAudioQuality(option.value)}
                                    className={`flex items-start gap-4 p-3 rounded-xl border transition-all text-left ${audioQuality === option.value ? 'bg-[#381E72] border-[#D0BCFF]' : 'bg-[#141218] border-transparent'}`}>
                                    <span className={`material-symbols-rounded text-xl mt-1 ${audioQuality === option.value ? 'text-[#D0BCFF]' : 'text-[#CAC4D0]'}`}>{option.icon}</span>
                                    <div>
                                        <span className={`text-sm font-medium ${audioQuality === option.value ? 'text-[#D0BCFF]' : 'text-[#E6E0E9]'}`}>{option.label}</span>
                                        <p className={`text-[10px] ${audioQuality === option.value ? 'text-[#E8DEF8]' : 'text-[#CAC4D0]'}`}>{option.description}</p>
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
                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-medium text-[#D0BCFF] uppercase tracking-wider">{t('statsForNerds')}</h3>
                         <button onClick={() => setShowStats(!showStats)} className={`w-12 h-6 rounded-full transition-colors relative ${showStats ? 'bg-[#D0BCFF]' : 'bg-[#49454F]'}`}>
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showStats ? 'left-7 bg-[#381E72]' : 'left-1'}`} />
                         </button>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-[#D0BCFF] mb-2 uppercase tracking-wider">{t('customCss')}</h3>
                        <textarea value={customCss} onChange={(e) => setCustomCss(e.target.value)} placeholder="body { background: red !important; }" className="w-full h-24 bg-[#141218] border border-[#938F99] rounded-[12px] p-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-[#D0BCFF]" />
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-[#D0BCFF] mb-2 uppercase tracking-wider">{t('customJs')}</h3>
                        <textarea value={customJs} onChange={(e) => setCustomJs(e.target.value)} placeholder="console.log('Injected!');" className="w-full h-24 bg-[#141218] border border-[#938F99] rounded-[12px] p-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-[#D0BCFF]" />
                        <p className="text-[10px] text-[#FFB4AB] mt-1">Warning: Use at your own risk. Malicious scripts can steal keys.</p>
                    </div>
                </>
            )}

            {activeTab === 'INTEGRATION' && (
                <>
                    <div>
                         <h3 className="text-sm font-medium text-[#D0BCFF] mb-2 uppercase tracking-wider">{t('discordWebhook')}</h3>
                         <input type="text" value={discordWebhook} onChange={(e) => setDiscordWebhook(e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-[#D0BCFF]" />
                         <p className="text-[10px] text-[#CAC4D0] mt-1">{t('discordNote')}</p>
                    </div>

                    <div>
                         <h3 className="text-sm font-medium text-[#D0BCFF] mb-2 uppercase tracking-wider">{t('customEndpoint')}</h3>
                         <input type="text" value={customEndpoint} onChange={(e) => setCustomEndpoint(e.target.value)} placeholder="https://api.example.com" className="w-full bg-[#141218] border border-[#938F99] rounded-[12px] px-4 py-3 text-[#E6E0E9] text-xs font-mono outline-none focus:border-[#D0BCFF]" />
                    </div>

                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-medium text-[#D0BCFF] uppercase tracking-wider">{t('forceHttps')}</h3>
                         <button onClick={() => setForceHttps(!forceHttps)} className={`w-12 h-6 rounded-full transition-colors relative ${forceHttps ? 'bg-[#D0BCFF]' : 'bg-[#49454F]'}`}>
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${forceHttps ? 'left-7 bg-[#381E72]' : 'left-1'}`} />
                         </button>
                    </div>
                </>
            )}

        </div>
        
        <div className="bg-[#1D1B20] p-4 text-center">
             <p className="text-[10px] text-[#49454F]">Lumina Music v2.0 • Pro Edition</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
