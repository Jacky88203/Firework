
import React, { useState, useCallback, useEffect } from 'react';
import FireworkEngine from './components/FireworkEngine';
import { generateShowTheme } from './services/geminiService';
import { ShowTheme, AppStatus } from './types';
import { Sparkles, Play, Pause, RefreshCw, Info, Sliders, Palette, Zap, Box, X } from 'lucide-react';

const DEFAULT_THEME: ShowTheme = {
  name: "Aurora Classic",
  description: "A serene dance of emerald and violet across the night sky.",
  colors: ["#10b981", "#8b5cf6", "#f43f5e", "#fbbf24"],
  launchFrequency: 0.03,
  particleCount: 120,
  particleSize: 2,
  explosionType: 'standard'
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<ShowTheme>(DEFAULT_THEME);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isPaused, setIsPaused] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showLab, setShowLab] = useState(false);

  const handleGenerateTheme = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setStatus(AppStatus.GENERATING_THEME);
    try {
      const newTheme = await generateShowTheme(prompt);
      setTheme(newTheme);
      setStatus(AppStatus.SHOW_ACTIVE);
      setPrompt("");
      // Briefly show the status then fade
      setTimeout(() => setStatus(AppStatus.IDLE), 3000);
    } catch (error) {
      console.error("Error creating show:", error);
      setStatus(AppStatus.IDLE);
    }
  };

  const updateTheme = (updates: Partial<ShowTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...theme.colors];
    newColors[index] = color;
    updateTheme({ colors: newColors });
  };

  const addColor = () => {
    updateTheme({ colors: [...theme.colors, "#ffffff"] });
  };

  const removeColor = (index: number) => {
    if (theme.colors.length <= 1) return;
    const newColors = theme.colors.filter((_, i) => i !== index);
    updateTheme({ colors: newColors });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white overflow-hidden selection:bg-purple-500/30">
      {/* Background Firework Engine */}
      <FireworkEngine 
        theme={theme} 
        isPaused={isPaused} 
      />

      {/* Top HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              CELESTIAL SYMPHONY
            </h1>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors text-slate-400"
            >
              <Info size={18} />
            </button>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest text-slate-400 flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
            THEME: {theme.name.toUpperCase()}
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowLab(!showLab)}
            className={`w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 ${showLab ? 'bg-purple-600/50 text-white border-purple-400/50' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
          >
            <Sliders size={20} />
          </button>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all active:scale-95 text-slate-300"
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Lab Sidebar */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 transition-transform duration-500 z-40 p-6 overflow-y-auto ${showLab ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black italic flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} fill="currentColor" />
            FIREWORKS LAB
          </h2>
          <button onClick={() => setShowLab(false)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          {/* Colors Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Palette size={14} /> Palette
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {theme.colors.map((color, idx) => (
                <div key={idx} className="relative group">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none"
                  />
                  <button 
                    onClick={() => removeColor(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addColor}
                className="w-full h-10 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all"
              >
                +
              </button>
            </div>
          </section>

          {/* Patterns Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Box size={14} /> Pattern
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['standard', 'ring', 'heart', 'star'].map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => updateTheme({ explosionType: pattern as any })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${theme.explosionType === pattern ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                >
                  {pattern}
                </button>
              ))}
            </div>
          </section>

          {/* Sliders Section */}
          <section className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Particle Size</h3>
                <span className="text-xs font-mono text-purple-400">{theme.particleSize.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.5" max="5" step="0.1" 
                value={theme.particleSize}
                onChange={(e) => updateTheme({ particleSize: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Launch Frequency</h3>
                <span className="text-xs font-mono text-purple-400">{(theme.launchFrequency * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.15" step="0.005" 
                value={theme.launchFrequency}
                onChange={(e) => updateTheme({ launchFrequency: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase">Particle Density</h3>
                <span className="text-xs font-mono text-purple-400">{theme.particleCount}</span>
              </div>
              <input 
                type="range" min="20" max="300" step="1" 
                value={theme.particleCount}
                onChange={(e) => updateTheme({ particleCount: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </section>
        </div>

        <div className="mt-auto pt-10">
          <button 
            onClick={() => setTheme(DEFAULT_THEME)}
            className="w-full py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            RESET TO DEFAULT
          </button>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 transition-all duration-500 ${showLab ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>
        <form 
          onSubmit={handleGenerateTheme}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a show mood (e.g., 'Retro Arcade', 'Volcanic Blast')..."
              className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-200 placeholder:text-slate-500 text-sm"
              disabled={status === AppStatus.GENERATING_THEME}
            />
            <button 
              type="submit"
              disabled={status === AppStatus.GENERATING_THEME || !prompt.trim()}
              className="px-6 py-3 bg-white text-slate-950 rounded-xl font-bold text-sm hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {status === AppStatus.GENERATING_THEME ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  DREAMING...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  AI DESIGN
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-4 flex justify-center items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
          <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-500" /> Tap to Launch</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1"><Palette size={10} className="text-purple-500" /> Custom Lab</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1"><Sparkles size={10} className="text-pink-500" /> Gemini AI</span>
        </div>
      </div>

      {/* Info Overlay */}
      {showInfo && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black italic mb-4 flex items-center gap-2">
              <Sparkles className="text-pink-500" fill="currentColor" /> SYMPHONY GUIDE
            </h2>
            <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <p>
                Celestial Symphony is an interactive canvas where physics meets imagination. 
                Our engine simulates particle velocity, gravity, and fluid air drag to create realistic pyrotechnics.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-1 text-xs">AI DESIGN</h4>
                  <p className="text-[11px]">Tell Gemini a mood and let it curate the physics and palette.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-1 text-xs">LAB MODE</h4>
                  <p className="text-[11px]">Open the Sliders panel to manually fine-tune your display.</p>
                </div>
              </div>
              <p className="text-xs bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 text-purple-300">
                PRO TIP: Click anywhere on the dark sky to launch a manual shell at that exact location.
              </p>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="mt-8 w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              ENTER THE SKY
            </button>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {status === AppStatus.SHOW_ACTIVE && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-full animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none">
          <span className="text-xs font-bold tracking-widest text-purple-300">
            NEW THEME CURATED: {theme.name.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default App;
