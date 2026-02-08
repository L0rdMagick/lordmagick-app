"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, Activity, Volume2, VolumeX, Eye, Brain, Settings, 
  X, Save, Trash2, Info, ArrowLeft, PauseCircle, Trophy, 
  Sparkles, Maximize2, BarChart2, ShieldAlert, Lock,
  ChevronsUp
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import MagickalBackLink from '@/app/components/MagickalBackLink';
import { useHaptics } from '@/hooks/useHaptics';
import PsychicStatsModal from '../components/PsychicStatsModal';
import { calculateZScore } from '../utils/psychicStats';

// Local stats logic removed in favor of shared utilities
/* --- AUDIO ENGINE --- */
const useAudioEngine = () => {
  const audioCtxRef = useRef<any>(null);
  const droneOscRef = useRef<any>(null);
  const gainNodeRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  const initAudio = () => {
    const win = (globalThis as any).window;
    if (!win) return;
    if (!audioCtxRef.current) {
      const AudioContext = win.AudioContext || win.webkitAudioContext;
      if (AudioContext) {
          audioCtxRef.current = new AudioContext();
          droneOscRef.current = audioCtxRef.current.createOscillator();
          gainNodeRef.current = audioCtxRef.current.createGain();
          
          droneOscRef.current.type = 'sine';
          droneOscRef.current.frequency.setValueAtTime(55, audioCtxRef.current.currentTime);
          
          const lfo = audioCtxRef.current.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(0.1, audioCtxRef.current.currentTime);
          const lfoGain = audioCtxRef.current.createGain();
          lfoGain.gain.setValueAtTime(20, audioCtxRef.current.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(droneOscRef.current.frequency);
          lfo.start();

          gainNodeRef.current.gain.setValueAtTime(0.02, audioCtxRef.current.currentTime); 
          droneOscRef.current.connect(gainNodeRef.current);
          gainNodeRef.current.connect(audioCtxRef.current.destination);
          droneOscRef.current.start();
      }
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: string) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'truth') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'lie') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'voice') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.05);
      osc.frequency.linearRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  };

  const toggleMute = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const target = isMuted ? 0.02 : 0;
      gainNodeRef.current.gain.setValueAtTime(target, audioCtxRef.current.currentTime);
      setIsMuted(!isMuted);
    }
  };

  return { initAudio, playSound, isMuted, toggleMute };
};

/* --- VISUAL COMPONENTS --- */

const CRTOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden h-full w-full">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] pointer-events-none" />
    <div className="absolute inset-0 bg-black opacity-[0.05] animate-pulse pointer-events-none" />
  </div>
);

const Waveform = ({ intensity = 1, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let offset = 0;
    const render = () => {
      if (isPaused) return;
      if (canvas.parentElement) {
          canvas.width = canvas.parentElement.offsetWidth;
          canvas.height = canvas.parentElement.offsetHeight;
      }
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      const amplitude = (height / 4) * intensity;
      const frequency = 0.02;
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + offset) * amplitude + Math.sin(x * 0.05 + offset * 2) * (amplitude / 2);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + (intensity * 0.5)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      offset += 0.1 + (intensity * 0.1);
      const win = (globalThis as any).window;
      if(win) animationFrameId = win.requestAnimationFrame(render);
    };
    render();
    return () => {
        const win = (globalThis as any).window;
        if(win) win.cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, isPaused]);
  return <canvas ref={canvasRef} className="w-full h-32 md:h-48" />;
};

/* --- MAIN VERITAS APP --- */
export default function VeritasApp() {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [gameState, setGameState] = useState('INSTRUCTIONS'); 
  const [gameMode, setGameMode] = useState('QUICK_FIRE');
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Settings
  const [customTimeLimit, setCustomTimeLimit] = useState(5);
  const [useDefaultPhrases, setUseDefaultPhrases] = useState(true);
  const [customPhrases, setCustomPhrases] = useState<string[]>([]);
  const [rawCustomText, setRawCustomText] = useState('');

  // Game Logic
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isTrue, setIsTrue] = useState(false);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(customTimeLimit);
  const [glitching, setGlitching] = useState(false);
  
  const { initAudio, playSound, isMuted, toggleMute } = useAudioEngine();
  const haptics = useHaptics();

  // Handle Pause when Stats Modal Open
  const handleStatsPause = useCallback((paused: boolean) => {
    if (gameState === 'PLAYING') {
      setIsPaused(paused);
    }
  }, [gameState]);

  /* --- LOGIC --- */
  
  // DATA ASSETS
  const DEFAULT_PHRASES = [
    "I did not take the money.", "I was home all night.", "I swear I didn't see anything.",
    "I have no idea who he is.", "The gun wasn't mine.", "I was alone.", "I didn't touch the files.",
    "I've never been there.", "I didn't sign that.", "I don't know the code.",
    "I was driving alone.", "I lost my phone.", "It was like that when I got here.",
    "I didn't delete the footage.", "I don't know her name.", "I have an alibi.",
    "I love you.", "It’s not you, it’s me.", "I'm just tired.", "I've never met her before.",
    "I'm fine.", "Nothing is wrong.", "I'll call you later.", "We need to talk.", "I promise.",
    "You're the only one.", "I didn't mean it.", "I was just checking my phone.",
    "This tastes delicious.", "I'm 5 minutes away.", "I’d love to come to your party.",
    "You look great in that.", "I already ate.", "My phone died.", "I didn't see your text.",
    "It's exactly what I wanted.", "I'm busy that night.", "Traffic was terrible.",
    "I'll have that report by morning.", "It was a team effort.", "We are currently over budget.",
    "I read the memo.", "The system is secure.", "We appreciate your feedback.",
    "I'm working on it now.", "Let's circle back.", "My calendar is full.", "It's a glitch.",
    "It feels right.", "I think we are alone.", "Someone is watching.", "I remember everything.",
    "It wasn't a dream.", "They are coming.", "Leave it there.", "Don't open it.",
    "I heard a noise.", "The door was open.", "I saw a light.", "It's gone."
  ];

  const saveSessionStats = async (newHistory: any[]) => {
      setSaveMessage("Attuning to Cloud...");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaveMessage(null); return; }

        const hits = newHistory.filter(h => h.correct).length;
        const total = newHistory.length;
        const currentStreak = newHistory.length > 0 && newHistory[newHistory.length - 1].correct ? streak + 1 : 0;

        const statsObject = {
            hits, total, streak: currentStreak,
            tp: newHistory.filter(h => h.actual === true && h.correct).length,
            tn: newHistory.filter(h => h.actual === false && h.correct).length,
            fp: newHistory.filter(h => h.actual === false && !h.correct).length,
            fn: newHistory.filter(h => h.actual === true && !h.correct).length,
        };

        if (sessionId) {
            const { error } = await supabase
                .from('reports')
                .update({ 
                    chart_data: statsObject,
                    report_content: `Veritas Auto-save. Trials: ${total}. Mode: ${gameMode}.`
                })
                .eq('id', sessionId);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from('reports')
                .insert({
                    user_id: user.id,
                    name: 'Veritas',
                    category: 'training',
                    chart_data: statsObject,
                    report_content: `New Veritas Session. Mode: ${gameMode}.`
                })
                .select()
                .single();
            if (error) throw error;
            if (data) setSessionId(data.id);
        }
        setSaveMessage("Energy Captured");
        setTimeout(() => setSaveMessage(null), 1500);
      } catch (err) {
          console.error("Save failed", err);
          setSaveMessage("Connection Severed");
      }
  };

  const handleDeleteLifetime = async () => {
      if(!confirm("WARNING: This will permanently purge all Veritas training records. Continue?")) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        const { error } = await supabase.from('reports').delete().eq('user_id', user.id).eq('name', 'Veritas');
        if (error) throw error;
        alert("DATABASE PURGED.");
        setHistory([]);
        setSessionId(null);
      } catch(e) {
          console.error(e);
          alert("PURGE FAILED.");
      }
  };

  const startGame = (mode: string) => {
    if (!useDefaultPhrases && customPhrases.length === 0) {
      alert("No data available. Add custom phrases or enable defaults.");
      return;
    }
    setGameMode(mode);
    setGameState('PLAYING');
    setIsPaused(false);
    setHistory([]);
    setStreak(0);
    setSessionId(null);
    startRound(mode);
  };

  const startRound = useCallback((mode: string) => {
    let pool: string[] = [];
    if (useDefaultPhrases) pool = [...pool, ...DEFAULT_PHRASES];
    if (customPhrases.length > 0) pool = [...pool, ...customPhrases];
    if (pool.length === 0) pool = ["System Error: No Data"];

    const randomPhrase = pool[Math.floor(Math.random() * pool.length)];
    setCurrentPhrase(randomPhrase);
    
    const array = new Uint32Array(1);
    const win = (globalThis as any).window;
    if (win && win.crypto) {
        win.crypto.getRandomValues(array);
        setIsTrue(array[0] % 2 === 0);
    } else {
        setIsTrue(Math.random() > 0.5);
    }
    
    setFeedback(null);
    setFeedbackMessage('');
    setGlitching(false);
    
    if (mode === 'QUICK_FIRE') {
      setTimeLeft(customTimeLimit);
    } else {
      setTimeLeft(null);
    }
    playSound('voice');
  }, [useDefaultPhrases, customPhrases, customTimeLimit, playSound]); 

  const nextRound = useCallback(() => {
    startRound(gameMode);
  }, [gameMode, startRound]); 

  useEffect(() => {
    if (gameState === 'PLAYING' && gameMode === 'QUICK_FIRE' && feedback === null && !isPaused) {
      if (timeLeft !== null && timeLeft > 0) {
        const timerId = setTimeout(() => setTimeLeft(prev => (prev !== null ? prev - 1 : 0)), 1000);
        return () => clearTimeout(timerId);
      } else if (timeLeft === 0) {
        handleGuess(null);
      }
    }
  }, [timeLeft, gameState, gameMode, feedback, isPaused]);

  // Decoupled pause logic
  const togglePause = () => {
    if (gameState === 'PLAYING' && !feedback && !isPaused) {
      setIsPaused(true);
    }
  };

  const toggleResume = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsPaused(false);
  }

  const handleGuess = (userGuessBoolean: boolean | null) => {
    if (feedback || isPaused) return; 

    // 1. Medium Haptic on interaction start
    haptics.triggerMedium();

    const correct = userGuessBoolean === isTrue;
    const isTimeout = userGuessBoolean === null;
    let msg = "";
    if (isTimeout) {
      msg = "TIMED OUT";
      haptics.triggerLight(); // Negative result
    } else {
      const resultStr = correct ? "CORRECT" : "INCORRECT";
      const realityStr = isTrue ? "A TRUTH" : "A LIE";
      msg = `${resultStr}: IT WAS ${realityStr}`;
      
      // 2. Result Haptic
      if (correct) haptics.triggerHeavy();
      else haptics.triggerLight();
    }

    setFeedback(correct ? 'CORRECT' : 'WRONG');
    setFeedbackMessage(msg);
    if (!correct) setGlitching(true);
    playSound(correct ? 'truth' : 'lie');

    const newRecord = {
      phrase: currentPhrase,
      guess: userGuessBoolean,
      actual: isTrue,
      correct: correct && !isTimeout,
      timestamp: Date.now()
    };
    const updatedHistory = [...history, newRecord];
    setHistory(updatedHistory);

    if (correct && !isTimeout) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      if (gameMode === 'STREAK') {
        setTimeout(() => setGameState('RESULTS'), 2000);
        saveSessionStats(updatedHistory);
        return;
      }
    }
    saveSessionStats(updatedHistory);
    setTimeout(() => {
      nextRound();
    }, 2000);
  };

  /* --- RENDERERS --- */

  const renderInstructions = () => (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-6 py-8 overflow-y-auto custom-scrollbar">
      <div className="flex-none mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-black tracking-[0.2em] text-white/90 font-mono mb-2">VERITAS</h1>
        <p className="text-cyan-500 font-mono tracking-widest text-lg">LIE DETECTOR TRAINING</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
        <div className="space-y-6">
          <section className="bg-white/5 border border-white/10 p-6 rounded-sm">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Eye size={20} className="text-cyan-400"/> THE MISSION</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-mono">
              In a world of noise, intuition is your only compass. Veritas is designed to decouple your logic from your gut instinct. You will act as a &quot;Human Polygraph.&quot;
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-sm">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Brain size={20} className="text-fuchsia-400"/> THE MECHANIC</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-mono">
              1. A phrase appears. <br/>
              2. The system secretly flips a coin (RNG) to decide if it is a <strong>TRUTH</strong> or a <strong>LIE</strong>.<br/>
              3. The result is NOT based on the text content, but on the hidden &quot;energy&quot; of the moment.<br/>
              4. You must feel the answer.
            </p>
          </section>
        </div>

        <div className="space-y-6">
           <section className="bg-white/5 border border-white/10 p-6 rounded-sm">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Activity size={20} className="text-green-400"/> THE GOAL</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-mono">
              Train your subconscious to detect subtle variances. Improve your ability to read situations where logic fails. Overcome your &quot;Trust Bias&quot; or &quot;Suspicion Bias.&quot;
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 rounded-sm">
             <div className="text-center pt-2">
                <button 
                  onClick={() => { initAudio(); setGameState('MENU'); }}
                  className="w-full py-4 bg-cyan-900/20 hover:bg-cyan-500/20 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all duration-300 font-mono font-bold tracking-widest text-lg uppercase group"
                >
                  <span className="group-hover:translate-x-1 inline-block transition-transform">Begin Training &rarr;</span>
                </button>
                <p className="text-xs text-gray-600 mt-2 font-mono">Audio Required for Immersion</p>
             </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold font-mono tracking-wider">SYSTEM CONFIG</h2>
        <button onClick={() => setGameState('MENU')} className="text-white/50 hover:text-white"><X /></button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        <section className="space-y-4">
          <h3 className="text-cyan-400 font-mono text-sm tracking-widest border-b border-white/10 pb-2">TIMING PROTOCOLS</h3>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300">Quick Fire Duration (Sec)</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setCustomTimeLimit(Math.max(1, customTimeLimit - 1))} className="p-2 border border-white/20 hover:bg-white/10"><VolumeX size={16}/></button>
              <span className="font-mono text-xl w-8 text-center">{customTimeLimit}</span>
              <button onClick={() => setCustomTimeLimit(customTimeLimit + 1)} className="p-2 border border-white/20 hover:bg-white/10"><Volume2 size={16}/></button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-cyan-400 font-mono text-sm tracking-widest border-b border-white/10 pb-2">DATA INJECTION</h3>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300">Use Standard Database (100+)</span>
            <button 
              onClick={() => setUseDefaultPhrases(!useDefaultPhrases)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${useDefaultPhrases ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${useDefaultPhrases ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-sm text-gray-300 block">Custom Phrases (One per line)</label>
            <textarea 
              value={rawCustomText}
              onChange={(e) => setRawCustomText(e.target.value)}
              className="w-full h-48 bg-black border border-white/20 p-4 font-mono text-xs text-green-400 focus:border-cyan-500 focus:outline-none resize-none"
              placeholder="I didn't do it.&#10;She is lying.&#10;The sky is blue."
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono">{customPhrases.length} custom phrases active.</span>
              <button 
                onClick={() => {
                    const lines = rawCustomText.split('\n').filter(line => line.trim().length > 0);
                    setCustomPhrases(lines);
                    alert(`Saved ${lines.length} custom phrases.`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-cyan-900/40 text-sm font-mono border border-white/20 hover:border-cyan-500 transition-colors"
              >
                <Save size={14} /> SAVE CUSTOM DATA
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-fuchsia-500 font-mono text-sm tracking-widest border-b border-fuchsia-900/30 pb-2">DANGER ZONE</h3>
            <button 
                onClick={handleDeleteLifetime}
                className="w-full py-3 bg-red-900/10 hover:bg-red-900/30 border border-red-500/30 text-red-500 rounded flex items-center justify-center gap-2 text-xs font-bold tracking-widest font-mono hover:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all"
            >
                <Trash2 size={14} /> PURGE LIFETIME DATA
            </button>
        </section>
      </div>
    </div>
  );

  /* --- LOGIC --- */
  
  // Helper to get stats object
  const getStatsProps = (historyArr: any[]) => {
      const hits = historyArr.filter(h => h.correct).length;
      const trials = historyArr.length;
      const chance = 0.5;
      
      const tp = historyArr.filter(h => h.actual === true && h.correct).length;
      const tn = historyArr.filter(h => h.actual === false && h.correct).length;
      const fp = historyArr.filter(h => h.actual === false && !h.correct).length;
      const fn = historyArr.filter(h => h.actual === true && !h.correct).length;

      // Calculate Max Streak
      let maxStreak = 0;
      let currentStreak = 0;
      history.forEach(h => {
          if (h.correct) {
              currentStreak++;
              if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
              currentStreak = 0;
          }
      });

      return {
          hits,
          trials,
          chance,
          matrixData: {
              tp, tn, fp, fn,
              labels: ["TRUTH", "LIE"] as [string, string]
          },
          radarData: [
              { id: 'sense', label: 'Truth Sense', value: (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0, color: '#facc15' },
              { id: 'spec', label: 'Lie Detect', value: (tn + fp) > 0 ? (tn / (tn + fp)) * 100 : 0, color: '#22d3ee' },
              { id: 'acc', label: 'Combined', value: trials > 0 ? (hits / trials) * 100 : 0, color: '#a78bfa' }
          ],
          maxStreak
      };
  };

  const renderMenu = () => (
    // Updated container to allow scrolling on mobile while centering contents
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center min-h-full max-w-2xl mx-auto px-6 py-12 space-y-12 animate-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-black tracking-[0.15em] text-white mb-2 font-mono">VERITAS</h1>
          <p className="text-cyan-500/80 font-mono text-sm tracking-widest uppercase">Select Training Module</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { id: 'QUICK_FIRE', label: 'Quick Fire', icon: Zap, desc: `${customTimeLimit}s Limit. Gut Instinct.` },
            { id: 'DEEP_SCAN', label: 'Deep Scan', icon: Eye, desc: 'No Limit. Meditate.' },
            { id: 'STREAK', label: 'Streak', icon: ShieldAlert, desc: 'One mistake ends it.' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => startGame(mode.id)}
              className="group relative flex flex-col items-center p-6 border border-white/10 hover:border-cyan-500/50 bg-black hover:bg-cyan-950/10 transition-all duration-300"
            >
              <mode.icon className="w-8 h-8 text-white/70 group-hover:text-cyan-400 mb-4 transition-colors" />
              <span className="text-white font-mono font-bold tracking-wider mb-2">{mode.label}</span>
              <span className="text-xs text-gray-500 font-mono text-center">{mode.desc}</span>
              <div className="absolute top-0 left-0 w-1 h-1 bg-white/20 group-hover:bg-cyan-400 transition-colors" />
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/20 group-hover:bg-cyan-400 transition-colors" />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 items-center">
          {/* Link to Detailed Stats */}
          <div className="relative">
             <PsychicStatsModal {...getStatsProps([])} appName="Veritas" className="relative group flex items-center gap-2 cursor-pointer" />
          </div>

          <div className="hidden md:block w-px h-4 bg-white/20"></div>

          <button 
            onClick={() => setGameState('SETTINGS')}
            className="text-gray-500 hover:text-white font-mono text-xs tracking-widest flex items-center gap-2 transition-colors"
          >
            <Settings size={14} /> SYSTEM CONFIG
          </button>
          
          <div className="hidden md:block w-px h-4 bg-white/20"></div>

          <button 
            onClick={() => setGameState('INSTRUCTIONS')}
            className="text-gray-500 hover:text-white font-mono text-xs tracking-widest flex items-center gap-2 transition-colors"
          >
            <Info size={14} /> PROTOCOL BRIEF
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div 
      className="relative flex flex-col h-full w-full max-w-5xl mx-auto py-6 px-4 md:py-12 md:px-8 cursor-pointer"
      onClick={togglePause} // Only pauses
    >
      {isPaused && (
        <div 
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={toggleResume} // Explicitly resumes
        >
           <PauseCircle size={64} className="text-cyan-500 mb-4 animate-pulse" />
           <h2 className="text-3xl font-black text-white tracking-widest font-mono">SYSTEM PAUSED</h2>
           <p className="text-cyan-500/70 mt-4 font-mono text-sm tracking-widest animate-pulse">TAP SCREEN TO RESUME</p>
        </div>
      )}

      <div className="flex-none flex flex-col md:flex-row justify-between items-center font-mono text-xs text-white/40 tracking-widest mb-4 z-40 gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={(e) => { e.stopPropagation(); setGameState('MENU'); }}
            className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/10 px-3 py-2 rounded-sm transition-all border border-transparent hover:border-white/20"
          >
            <ArrowLeft size={16} /> <span className="hidden md:inline">EXIT MODE</span>
          </button>
          
          <div className="flex flex-col">
            <span className="uppercase text-white/30">{gameMode.replace('_', ' ')}</span>
            {gameMode === 'QUICK_FIRE' && (
              <span className={`text-xl ${timeLeft && timeLeft < 3 ? 'text-fuchsia-500 animate-pulse' : 'text-cyan-500'}`}>
                00:0{timeLeft}
              </span>
            )}
          </div>
        </div>

        {/* Stats Widget */}
        <div onClick={(e) => e.stopPropagation()} className="relative z-50">
            <PsychicStatsModal {...getStatsProps(history)} appName="Veritas" className="absolute top-4 right-4 z-50" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative min-h-0">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
          <Waveform intensity={feedback ? 0.1 : 2} isPaused={isPaused} />
        </div>
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-8">
          <h2 
            className="text-2xl md:text-5xl font-mono text-center leading-tight transition-all duration-100 max-w-4xl wrap-break-word"
            style={{ 
              color: feedback === 'CORRECT' ? '#22d3ee' : feedback === 'WRONG' ? '#d946ef' : '#ffffff',
              textShadow: glitching ? '2px 0 #ff00ff, -2px 0 #00ffff' : 'none',
              transform: glitching ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` : 'none'
            }}
          >
             &quot;{currentPhrase}&quot;
          </h2>
          <div className="h-16 flex items-center justify-center flex-col">
            {feedback && (
              <>
                <div className={`px-6 py-3 border-2 text-sm md:text-xl font-black uppercase tracking-widest text-center animate-in zoom-in duration-200 shadow-2xl ${
                  feedback === 'CORRECT' 
                    ? 'border-cyan-400 text-black bg-cyan-400' 
                    : 'border-fuchsia-500 text-black bg-fuchsia-500'
                }`}>
                  {feedbackMessage}
                </div>
                {saveMessage && <span className="text-[10px] text-gray-500 mt-2 font-mono animate-pulse">{saveMessage}</span>}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-none w-full flex flex-col items-center justify-center mt-4 md:mt-8 space-y-6">
        <div className="w-full grid grid-cols-2 gap-4 md:gap-8 max-w-3xl">
          <button
            onClick={(e) => { e.stopPropagation(); handleGuess(true); }}
            disabled={!!feedback || isPaused}
            className="group relative h-20 md:h-24 border-2 border-cyan-900/50 hover:border-cyan-400 bg-black transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-cyan-900/10 group-hover:bg-cyan-400/10 transition-colors" />
            <span className="relative z-10 text-xl md:text-2xl font-bold tracking-[0.2em] text-cyan-500 group-hover:text-cyan-300 font-mono">TRUTH</span>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleGuess(false); }}
            disabled={!!feedback || isPaused}
            className="group relative h-20 md:h-24 border-2 border-fuchsia-900/50 hover:border-fuchsia-500 bg-black transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-fuchsia-900/10 group-hover:bg-fuchsia-500/10 transition-colors" />
            <span className="relative z-10 text-xl md:text-2xl font-bold tracking-[0.2em] text-fuchsia-500 group-hover:text-fuchsia-300 font-mono">LIE</span>
            <div className="absolute bottom-0 right-0 h-1 w-full bg-fuchsia-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-mono animate-pulse">
          Tap Empty Space to Pause
        </p>
        <button 
          onClick={(e) => { e.stopPropagation(); setGameState('RESULTS'); }}
          className="text-white/20 hover:text-white/60 text-xs font-mono uppercase tracking-widest z-40"
        >
          End Session
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    const total = history.length;
    const correct = history.filter(h => h.correct).length;
    const acc = total > 0 ? (correct/total)*100 : 0;
    
    return (
    <div className="flex flex-col items-center h-full w-full max-w-4xl mx-auto px-6 py-8 space-y-6 animate-in slide-in-from-bottom-10 duration-500 overflow-y-auto custom-scrollbar">
      <div className="text-center space-y-1 flex-none">
        <h2 className="text-3xl font-bold text-white font-mono tracking-wider">SESSION ANALYSIS</h2>
        <p className="text-gray-500 font-mono text-xs">{new Date().toLocaleTimeString()}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full flex-none">
         <div className="bg-white/5 border border-white/10 p-4 flex flex-col items-center">
            <span className="text-3xl font-mono font-bold text-white">{acc.toFixed(0)}%</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Overall Accuracy</span>
         </div>
         <div className="bg-white/5 border border-white/10 p-4 flex flex-col items-center">
            <span className="text-3xl font-mono font-bold text-white">{total}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Total Rounds</span>
         </div>
         <div className="bg-white/5 border border-white/10 p-4 flex flex-col items-center">
            <span className="text-3xl font-mono font-bold text-white">{correct}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Correct</span>
         </div>
         <div className="bg-white/5 border border-white/10 p-4 flex flex-col items-center">
            <span className="text-3xl font-mono font-bold text-white">{total - correct}</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Incorrect</span>
         </div>
      </div>
      <div className="w-full flex-none flex justify-center py-8 relative">
           <PsychicStatsModal {...getStatsProps(history)} appName="Veritas" />
      </div>
      <button 
        onClick={() => setGameState('MENU')}
        className="flex-none px-8 py-3 bg-white text-black font-mono font-bold hover:bg-cyan-400 transition-colors tracking-wider"
      >
        RETURN TO MENU
      </button>
    </div>
  )};

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white overflow-hidden select-none font-sans flex flex-col">
      <CRTOverlay />
      <header className="relative z-50 px-6 py-4 flex justify-between items-center border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
        
        {(gameState === 'INSTRUCTIONS' || gameState === 'MENU') ? (
            <MagickalBackLink href="/the-magick-psychic-school/psychic-training" text="Exit Training" className="text-sm font-mono tracking-widest text-cyan-500 hover:text-cyan-300" />
        ) : (
            <button 
              onClick={() => setGameState('MENU')}
              className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 transition-colors font-mono tracking-widest text-sm"
            >
              <ArrowLeft size={16} /> EXIT SESSION
            </button>
        )}

        <button 
          onClick={toggleMute}
          className="text-white/30 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </header>
      <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
        {gameState === 'INSTRUCTIONS' && renderInstructions()}
        {gameState === 'MENU' && renderMenu()}
        {gameState === 'SETTINGS' && renderSettings()}
        {gameState === 'PLAYING' && renderGame()}
        {gameState === 'RESULTS' && renderResults()}
      </div>
    </div>
  );
}