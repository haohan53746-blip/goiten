
import React, { useEffect, useState } from 'react';
import { Student, Level } from '../types';
import { Sparkles, X, Trophy, Wand2, Loader2 } from 'lucide-react';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import { audioService } from '../services/audioService';
import { generateLuckyMessage } from '../services/geminiService';

interface Props {
  student: Student;
  level: Level;
  subject: string;
  onClose: () => void;
}

const ResultModal: React.FC<Props> = ({ student, level, subject, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    audioService.playWin();
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#A855F7', '#EC4899', '#6366F1', '#FACC15', '#22C55E']
    });

    // Lấy API Key từ Local Storage để gọi AI
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setLoadingAi(true);
      generateLuckyMessage(savedKey, student.name, level, subject)
        .then(msg => setAiMessage(msg))
        .finally(() => setLoadingAi(false));
    }
  }, [student.name, level, subject]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-900 p-8 md:p-10 rounded-[40px] border-4 border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.4)] max-w-lg w-full transform transition-all duration-500 scale-100 hover:scale-[1.02]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
        >
          <X size={28} />
        </button>

        <div className="text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full shadow-2xl">
              <Trophy className="text-purple-900" size={56} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-purple-300 mb-2 uppercase tracking-[0.3em]">Người được chọn là</h2>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl py-10 px-6 mb-6 border border-white/10 shadow-inner">
             <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              {student.name}
            </h1>
          </div>

          {/* AI Message Section */}
          <div className="min-h-[60px] flex items-center justify-center mb-8 px-4">
            {loadingAi ? (
              <div className="flex items-center gap-2 text-purple-400/60 animate-pulse italic">
                <Loader2 className="animate-spin" size={18} />
                <span>Đang nghe lời tiên tri...</span>
              </div>
            ) : aiMessage ? (
              <div className="relative p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                <Wand2 className="absolute -top-3 -left-3 text-yellow-400 -rotate-12" size={24} />
                <p className="text-lg font-medium text-purple-100 italic">
                  "{aiMessage}"
                </p>
                <Sparkles className="absolute -bottom-2 -right-2 text-yellow-400" size={16} />
              </div>
            ) : (
              <div className="flex justify-center gap-3">
                <Sparkles className="text-yellow-400 animate-spin-slow" />
                <span className="text-white/60 font-medium italic">Tiết học của chúng ta bắt đầu thôi!</span>
                <Sparkles className="text-yellow-400 animate-spin-slow" />
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-xl rounded-2xl hover:from-purple-400 hover:to-indigo-400 transition-all shadow-lg hover:shadow-purple-500/30"
          >
            SẴN SÀNG CHƯA?
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
