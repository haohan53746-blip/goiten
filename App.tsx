
import React, { useState, useCallback, useEffect } from 'react';
import { Student, Level, GameState } from './types';
import { DEFAULT_STUDENTS, SUBJECTS } from './constants';
import Wheel from './components/Wheel';
import StudentManager from './components/StudentManager';
import ResultModal from './components/ResultModal';
import { audioService } from './services/audioService';
import { Sparkles, Wand2, GraduationCap, BookOpen, Settings2, Volume2, VolumeX, Heart, Key, Check, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    students: DEFAULT_STUDENTS.map(name => ({ id: Math.random().toString(), name })),
    selectedStudent: null,
    history: [],
    isSpinning: false,
    level: Level.ELEMENTARY,
    subject: SUBJECTS[0],
  });

  const [showConfig, setShowConfig] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  
  // State cho API Key
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);

  // Load API Key từ localStorage khi khởi động
  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setUserApiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const saveApiKey = () => {
    if (userApiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', userApiKey.trim());
      setIsKeySaved(true);
      setShowKeyInput(false);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      setIsKeySaved(false);
    }
  };

  const setStudents = (students: Student[]) => {
    setState(prev => ({ ...prev, students }));
  };

  const toggleMusic = () => {
    const isPlaying = audioService.toggleBackgroundMusic();
    setMusicEnabled(isPlaying);
  };

  const startSpin = () => {
    if (state.students.length === 0 || state.isSpinning) return;
    audioService.playStart();
    setState(prev => ({ ...prev, isSpinning: true, selectedStudent: null }));
  };

  const onWheelFinish = useCallback((student: Student) => {
    setState(prev => ({ ...prev, isSpinning: false, selectedStudent: student }));
  }, []);

  const closeResult = () => {
    if (state.selectedStudent) {
      setState(prev => ({
        ...prev,
        selectedStudent: null,
        history: [state.selectedStudent!, ...prev.history].slice(0, 10)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 flex flex-col items-center selection:bg-purple-500/30">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[24px] shadow-2xl shadow-purple-500/20 rotate-3 border border-white/10">
            <Wand2 size={32} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-pink-300">
              LỚP HỌC PHÙ THỦY
            </h1>
            <p className="text-xs md:text-sm text-pink-400 font-bold uppercase tracking-[0.3em] opacity-80">Phép thuật gọi tên ngẫu nhiên</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          {/* API Key Config Button */}
          <div className="relative">
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`p-3 rounded-2xl transition-all border flex items-center gap-2 font-bold text-sm ${
                isKeySaved 
                ? 'bg-green-600/20 border-green-500/50 text-green-400' 
                : 'bg-yellow-600/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-600/20'
              }`}
            >
              <Key size={20} />
              <span className="hidden sm:inline">{isKeySaved ? 'ĐÃ CÓ AI' : 'CẤU HÌNH AI'}</span>
            </button>

            {showKeyInput && (
              <div className="absolute top-full right-0 mt-3 z-30 w-72 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl">
                <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                  <Wand2 size={16} /> Nhập Gemini API Key
                </h4>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                  Key được lưu cục bộ trên trình duyệt của bạn, không gửi đi nơi khác.
                </p>
                <div className="space-y-3">
                  <input 
                    type="password"
                    placeholder="AI_Key_Của_Bạn..."
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={saveApiKey}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      LƯU KEY
                    </button>
                    <button 
                      onClick={() => {
                        setUserApiKey('');
                        localStorage.removeItem('GEMINI_API_KEY');
                        setIsKeySaved(false);
                      }}
                      className="px-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 py-2 rounded-xl text-xs transition-all"
                    >
                      XÓA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={toggleMusic}
            className={`p-3 rounded-2xl transition-all border flex items-center gap-2 font-bold text-sm ${
              musicEnabled 
              ? 'bg-pink-600/20 border-pink-500 text-pink-400' 
              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span className="hidden md:inline">{musicEnabled ? 'TẮT NHẠC' : 'BẬT NHẠC'}</span>
          </button>
          
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-xl"
          >
            <Settings2 size={24} className="text-slate-400" />
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Controls */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-pink-400 uppercase font-black tracking-widest">
                <GraduationCap size={16} /> Cấp học
              </label>
              <select 
                value={state.level}
                onChange={(e) => setState(prev => ({ ...prev, level: e.target.value as Level }))}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
              >
                {Object.values(Level).map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-pink-400 uppercase font-black tracking-widest">
                <BookOpen size={16} /> Môn học
              </label>
              <select 
                value={state.subject}
                onChange={(e) => setState(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium"
              >
                {SUBJECTS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xs text-pink-400 uppercase font-black mb-4 tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> Lịch sử chọn tên
            </h3>
            <div className="space-y-2">
              {state.history.length === 0 && <p className="text-slate-500 italic text-sm text-center py-4">Chưa có ai được chọn</p>}
              {state.history.map((s, i) => (
                <div key={i} className="bg-white/5 px-4 py-3 rounded-xl text-sm flex justify-between items-center border border-white/5 hover:border-pink-500/30 transition-colors">
                  <span className="font-bold">{s.name}</span>
                  <span className="text-white/20 text-[10px]">{i === 0 ? 'MỚI NHẤT' : `#${state.history.length - i}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: The Wheel */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 py-4">
          <div className="relative group">
            <div className="absolute -inset-10 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl opacity-50"></div>
            <Wheel 
              students={state.students} 
              isSpinning={state.isSpinning} 
              onFinish={onWheelFinish} 
            />
          </div>
          
          <button 
            onClick={startSpin}
            disabled={state.isSpinning || state.students.length === 0}
            className={`mt-16 px-16 py-6 rounded-[28px] font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all active:scale-95 flex items-center gap-4 border-2 ${
              state.isSpinning || state.students.length === 0
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-white/5'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 border-white/20 hover:shadow-purple-500/40 hover:-translate-y-2 hover:brightness-110'
            }`}
          >
            {state.isSpinning ? 'ĐANG QUAY...' : 'BẮT ĐẦU NGAY!'}
            {!state.isSpinning && <Wand2 size={28} />}
          </button>
        </div>

        {/* Right Side: Student List */}
        <div className="lg:col-span-3 h-[600px] order-3">
          <StudentManager 
            students={state.students} 
            setStudents={setStudents} 
          />
        </div>
      </main>

      {state.selectedStudent && (
        <ResultModal 
          student={state.selectedStudent} 
          level={state.level}
          subject={state.subject}
          onClose={closeResult} 
        />
      )}

      {/* Footer credits */}
      <footer className="mt-20 text-center space-y-6 pb-12 w-full max-w-2xl">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          <p className="text-slate-400 text-sm font-medium">Cùng học, cùng chơi, cùng sáng tạo!</p>
        </div>
        
        <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-400 font-bold tracking-wider">
            <span>Phát triển bởi</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">thầy Giới</span>
            <Heart size={14} className="text-pink-500 fill-pink-500 animate-bounce" />
          </div>
          <div className="text-slate-500 font-mono text-sm bg-white/5 px-4 py-1 rounded-full border border-white/5">
            0972300864
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
