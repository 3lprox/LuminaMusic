
import React from 'react';
import { AudioQuality, Language } from '../types';
import { getTranslation } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioQuality: AudioQuality;
  setAudioQuality: (q: AudioQuality) => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, audioQuality, setAudioQuality, language, setLanguage }) => {
  if (!isOpen) return null;

  const t = (key: any) => getTranslation(language, key);

  const options: { value: AudioQuality; label: string; description: string; icon: string }[] = [
    { 
      value: 'LOW', 
      label: 'Baja (Ahorro de datos)', 
      description: 'Consume menos datos, carga más rápido.',
      icon: 'data_saver_on'
    },
    { 
      value: 'NORMAL', 
      label: 'Normal', 
      description: 'Equilibrio estándar.',
      icon: 'equalizer'
    },
    { 
      value: 'HIGH', 
      label: 'Alta (Máxima fidelidad)', 
      description: 'Mejor experiencia auditiva.',
      icon: 'high_quality'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[28px] bg-[#2B2930] shadow-2xl elevation-3 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 pt-6 pb-4 flex justify-between items-center">
            <h2 className="text-xl text-[#E6E0E9]">{t('settings')}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#E6E0E9]/10 text-[#CAC4D0] hover:text-[#E6E0E9]">
                <span className="material-symbols-rounded">close</span>
            </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-6">
            
            {/* Language Section */}
            <div>
                 <h3 className="text-sm font-medium text-[#D0BCFF] mb-3 uppercase tracking-wider">{t('language')}</h3>
                 <div className="flex bg-[#141218] rounded-xl p-1 border border-[#49454F]">
                     <button 
                        onClick={() => setLanguage('EN')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'EN' ? 'bg-[#381E72] text-[#D0BCFF]' : 'text-[#CAC4D0] hover:text-[#E6E0E9]'}`}
                     >
                        English
                     </button>
                     <button 
                        onClick={() => setLanguage('ES')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'ES' ? 'bg-[#381E72] text-[#D0BCFF]' : 'text-[#CAC4D0] hover:text-[#E6E0E9]'}`}
                     >
                        Español
                     </button>
                 </div>
            </div>

            {/* Audio Quality Section */}
            <div>
                <h3 className="text-sm font-medium text-[#D0BCFF] mb-3 uppercase tracking-wider">{t('audioQuality')}</h3>
                <div className="flex flex-col gap-3">
                    {options.map((option) => {
                        const isSelected = audioQuality === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => setAudioQuality(option.value)}
                                className={`flex items-start gap-4 p-3 rounded-xl border transition-all text-left group
                                    ${isSelected 
                                        ? 'bg-[#381E72] border-[#D0BCFF]' 
                                        : 'bg-[#141218] border-transparent hover:border-[#938F99]'
                                    }
                                `}
                            >
                                <span className={`material-symbols-rounded text-xl mt-1 ${isSelected ? 'text-[#D0BCFF]' : 'text-[#CAC4D0]'}`}>
                                    {option.icon}
                                </span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium ${isSelected ? 'text-[#D0BCFF]' : 'text-[#E6E0E9]'}`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <span className="material-symbols-rounded text-[#D0BCFF] text-lg">check_circle</span>
                                        )}
                                    </div>
                                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#E8DEF8]' : 'text-[#CAC4D0]'}`}>
                                        {option.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
        
        <div className="bg-[#1D1B20] p-4 text-center">
             <p className="text-[10px] text-[#49454F]">Lumina Music v1.1 • Powered by YouTube</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
