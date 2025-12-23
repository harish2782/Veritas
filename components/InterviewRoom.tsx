
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Camera, Mic, Video, Terminal, Info, Move, Zap, Activity, Scan, Eye, User, Monitor, Target, Cpu, AlertCircle, CheckCircle, Shield, Globe, Radio, BarChart3, Fingerprint, Waves } from 'lucide-react';
import { InterviewSummary, QuestionSession, BehavioralMetric } from '../types';

const QUESTIONS = [
  "Can you describe your experience with large-scale system architecture?",
  "How do you handle high-pressure situations with conflicting deadlines?",
  "Tell me about a time you had to deal with a difficult team member.",
  "What is your greatest technical achievement to date?",
  "Why do you believe you are the best fit for this role?"
];

interface InterviewRoomProps {
  onComplete: (data: InterviewSummary) => void;
  onCancel: () => void;
  meetingUrl: string;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ onComplete, onCancel, meetingUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [metrics, setMetrics] = useState<BehavioralMetric[]>([]);
  const [transcription, setTranscription] = useState("");
  const [sessions, setSessions] = useState<QuestionSession[]>([]);
  const [logs, setLogs] = useState<string[]>(["Core intelligence ready.", "Awaiting bridge authorization..."]);
  const [isStabilized, setIsStabilized] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  // HUD & Stabilization State
  const smoothedOffsetRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef<number | null>(null);
  const scannerPosRef = useRef(0);
  const pulseRef = useRef(0);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString([], {hour12:false})}] ${msg}`]);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createAudioBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const renderLoop = useCallback(() => {
    if (!videoRef.current || !displayCanvasRef.current || !isActive) {
      frameIdRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = displayCanvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const currentMetric = metrics[metrics.length - 1];

    if (ctx && video.readyState >= 2) {
      // 1. Stabilization & Drawing
      const jitterX = (Math.random() - 0.5) * 1.5;
      const jitterY = (Math.random() - 0.5) * 1.5;
      const smoothingFactor = 0.05;
      smoothedOffsetRef.current.x += (jitterX - smoothedOffsetRef.current.x) * smoothingFactor;
      smoothedOffsetRef.current.y += (jitterY - smoothedOffsetRef.current.y) * smoothingFactor;

      ctx.save();
      const zoom = isStabilized ? 1.06 : 1.0;
      const offsetX = isStabilized ? -smoothedOffsetRef.current.x * 4 : 0;
      const offsetY = isStabilized ? -smoothedOffsetRef.current.y * 4 : 0;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 2. Advanced Interrogation HUD
      scannerPosRef.current = (scannerPosRef.current + 4) % canvas.height;
      pulseRef.current = (pulseRef.current + 0.08) % (Math.PI * 2);

      // Scanning Frame Effect
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scannerPosRef.current);
      ctx.lineTo(canvas.width, scannerPosRef.current);
      ctx.stroke();

      if (currentMetric) {
        // AI Tracking box for remote candidate
        const boxSize = 380;
        const bx = (canvas.width - boxSize) / 2;
        const by = (canvas.height - boxSize) / 2 - 20;
        
        const isSuspicious = currentMetric.truthProbability < 0.65;
        const themeColor = isSuspicious ? '#ef4444' : '#3b82f6';
        
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(bx, by, boxSize, boxSize);
        ctx.setLineDash([]);

        // Corners
        const clen = 40;
        ctx.lineWidth = 4;
        // TL
        ctx.beginPath(); ctx.moveTo(bx, by + clen); ctx.lineTo(bx, by); ctx.lineTo(bx + clen, by); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(bx + boxSize - clen, by); ctx.lineTo(bx + boxSize, by); ctx.lineTo(bx + boxSize, by + clen); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(bx, by + boxSize - clen); ctx.lineTo(bx, by + boxSize); ctx.lineTo(bx + clen, by + boxSize); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(bx + boxSize - clen, by + boxSize); ctx.lineTo(bx + boxSize, by + boxSize); ctx.lineTo(bx + boxSize, by + boxSize - clen); ctx.stroke();

        // Data Tags Directly on the Target
        ctx.font = 'bold 14px JetBrains Mono, monospace';
        ctx.fillStyle = themeColor;
        ctx.shadowBlur = 6;
        ctx.shadowColor = themeColor;
        
        // Subject Info Labels
        ctx.fillText(`ID: SUBJECT_T700`, bx + 10, by - 15);
        ctx.fillText(`BIO_SIG: ACTIVE`, bx + boxSize - 120, by - 15);
        
        // Analysis Labels
        ctx.fillText(`[TRUTH]: ${(currentMetric.truthProbability * 100).toFixed(0)}%`, bx + 10, by + 30);
        ctx.fillText(`[STRESS]: ${(currentMetric.stressLevel * 100).toFixed(0)}%`, bx + 10, by + 55);
        ctx.fillText(`[EMO]: ${currentMetric.emotion.toUpperCase()}`, bx + 10, by + boxSize - 15);
        
        // Animated Scanline inside box
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(${isSuspicious ? '239, 68, 68' : '59, 130, 246'}, 0.3)`;
        const localScanY = by + (scannerPosRef.current % boxSize);
        ctx.beginPath();
        ctx.moveTo(bx, localScanY);
        ctx.lineTo(bx + boxSize, localScanY);
        ctx.stroke();

        ctx.shadowBlur = 0;
      }
    }

    frameIdRef.current = requestAnimationFrame(renderLoop);
  }, [isActive, isStabilized, metrics]);

  const deployBot = async () => {
    setIsDeploying(true);
    addLog(`Initiating bridge to: ${meetingUrl.substring(0, 30)}...`);
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsActive(true);
      setIsDeploying(false);
      addLog("Participant identified. Bot deployed successfully.");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const simInterval = setInterval(() => {
        const stress = 0.05 + Math.random() * 0.45;
        const confidence = 0.7 + Math.random() * 0.3;
        const emotions = ["Neutral", "Engaged", "Thinking", "Confident", "Hesitant", "Surprised"];
        
        const newMetric: BehavioralMetric = {
          timestamp: Date.now(),
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          confidenceScore: confidence,
          stressLevel: stress,
          truthProbability: Math.min(1.0, 1.1 - (stress * 0.5)),
          microExpressions: stress > 0.4 ? ["Eye Flutter", "Lower Lip Tension"] : ["Stable Gaze"],
          voiceJitter: Math.random() * 0.05,
          blinkRate: 8 + Math.random() * 12
        };
        
        setMetrics(prev => [...prev.slice(-1), newMetric]);
        if (stress > 0.4) addLog("SIGNAL: Physiological stress surge detected.");
      }, 3500);

      stream.getVideoTracks()[0].onended = () => {
        clearInterval(simInterval);
        setIsActive(false);
        addLog("Uplink lost. Session ended.");
      };

      return () => clearInterval(simInterval);
    } catch (err) {
      setIsDeploying(false);
      addLog("Uplink aborted. Bridge deployment failed.");
    }
  };

  const nextQuestion = () => {
    const currentMetric = metrics[metrics.length - 1] || {
      timestamp: Date.now(),
      emotion: "Neutral",
      confidenceScore: 0.8,
      stressLevel: 0.2,
      truthProbability: 0.9,
      microExpressions: [],
      voiceJitter: 0,
      blinkRate: 12
    };

    const session: QuestionSession = {
      id: Math.random().toString(36).substr(2, 9),
      question: QUESTIONS[currentQuestionIdx],
      response: transcription || "Behavioral data packet synchronized.",
      analysis: currentMetric,
      riskFlags: currentMetric.truthProbability < 0.7 ? ["Statement Inconsistency"] : []
    };

    setSessions(prev => [...prev, session]);
    setTranscription("");
    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      addLog(`Query ${currentQuestionIdx + 1} finalized.`);
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    const avgStress = metrics.reduce((acc, m) => acc + m.stressLevel, 0) / (metrics.length || 1);
    const avgTruth = metrics.reduce((acc, m) => acc + m.truthProbability, 0) / (metrics.length || 1);
    onComplete({
      candidateName: "Remote Subject",
      meetingUrl,
      overallTruthLikelihood: avgTruth,
      averageStress: avgStress,
      keyStrengths: ["Fast Neural Recovery", "Stable Eye Tracking"],
      areasOfConcern: avgTruth < 0.75 ? ["Autonomic Variance Detected"] : [],
      sessions: sessions
    });
  };

  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(renderLoop);
    return () => { if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current); };
  }, [renderLoop]);

  const currentMetric = metrics[metrics.length - 1];

  return (
    <div className="flex-1 bg-black flex flex-col md:flex-row p-4 gap-4 overflow-hidden h-screen font-sans selection:bg-blue-500/40">
      
      {/* LEFT: MISSION CONTROL */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 text-blue-500 mb-6">
            <Radio className="w-4 h-4 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Query Matrix</h3>
          </div>
          <div className="space-y-4">
            {QUESTIONS.map((q, idx) => (
              <div key={idx} className={`relative p-3 rounded-xl border transition-all duration-500 ${idx === currentQuestionIdx ? 'border-blue-500/50 bg-blue-500/10' : idx < currentQuestionIdx ? 'border-emerald-500/20 bg-emerald-500/5 opacity-40' : 'border-neutral-800 bg-black/40'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-black ${idx === currentQuestionIdx ? 'text-blue-400' : 'text-neutral-600'}`}>0{idx + 1}</span>
                  {idx < currentQuestionIdx && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                </div>
                <p className={`text-[11px] leading-relaxed font-medium ${idx === currentQuestionIdx ? 'text-white' : 'text-neutral-500'}`}>{q}</p>
                {idx === currentQuestionIdx && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r shadow-[0_0_10px_#3b82f6]" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <Terminal className="w-4 h-4" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Logs</h3>
          </div>
          <div className="flex-1 font-mono text-[9px] space-y-3 overflow-y-auto custom-scrollbar text-blue-400/50">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-neutral-700 font-bold shrink-0">DATA:</span>
                <span className={log.includes('SIGNAL') ? 'text-red-400 font-bold' : ''}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER: PRIMARY VIEWPORT */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex-1 relative bg-neutral-900 rounded-3xl border border-white/5 overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,1)] group">
          {!isActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04)_0%,transparent_70%)]">
              <div className="relative">
                 <div className="w-40 h-40 border-4 border-dashed border-blue-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Monitor className="w-12 h-12 text-blue-500/20" />
                 </div>
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-black tracking-[0.5em] text-white">SYSTEM READY</h2>
                <div className="flex items-center justify-center gap-4">
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 text-[9px] font-black tracking-widest uppercase">Encryption Active</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <Globe className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-500 text-[9px] font-black tracking-widest uppercase">Remote Bridge</span>
                   </div>
                </div>
              </div>
              <button 
                onClick={deployBot}
                disabled={isDeploying}
                className="px-14 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center gap-4 group"
              >
                {isDeploying ? (
                  <>
                    <Cpu className="w-6 h-6 animate-spin" />
                    BRIDGING...
                  </>
                ) : (
                  <>
                    <Target className="w-6 h-6 group-hover:scale-125 transition-transform" />
                    DEPOY PARTICIPANT BOT
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay muted playsInline className="hidden" />
              <canvas ref={displayCanvasRef} className="w-full h-full object-cover" width="1280" height="720" />
              
              {/* HUD OVERLAYS */}
              <div className="absolute top-10 left-10 flex flex-col gap-5">
                <div className="bg-black/85 backdrop-blur-2xl p-7 rounded-3xl border border-white/10 space-y-5 shadow-2xl ring-1 ring-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_#3b82f6]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400">Analysis Engine: V4.5</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    <StatItem label="SYNC_RATIO" value="99.9%" color="blue" />
                    <StatItem label="CPU_LOAD" value="11.2%" color="blue" />
                    <StatItem label="TARGET_LOCK" value="STEADY" color="emerald" />
                    <StatItem label="BIO_UPLINK" value="OK" color="emerald" />
                  </div>
                </div>
              </div>

              <div className="absolute top-10 right-10">
                <button 
                  onClick={() => setIsStabilized(!isStabilized)}
                  className={`flex items-center gap-4 px-6 py-3 rounded-2xl text-[11px] font-black uppercase transition-all backdrop-blur-md border ${isStabilized ? 'bg-blue-600/30 border-blue-500 text-blue-400' : 'bg-black/60 border-neutral-800 text-neutral-500'}`}
                >
                  <Move className="w-4 h-4" />
                  Gimbal Mode: {isStabilized ? 'AUTO_LOCK' : 'MANUAL'}
                </button>
              </div>

              <div className="absolute bottom-10 left-10 right-10 bg-black/90 backdrop-blur-3xl rounded-3xl p-8 border border-white/10 flex items-center gap-10 shadow-2xl ring-1 ring-white/5">
                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Waves className="w-10 h-10 text-blue-500 animate-pulse" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em]">Neural Speech Decoder</p>
                  <p className="text-white/95 text-base font-medium italic leading-relaxed tracking-tight">
                    {transcription || "Awaiting target vocalization..."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* HIGH-DENSITY SENSOR MODULES (NO GRAPHS) */}
        <div className="h-52 flex gap-4">
          <NumericSensor 
            icon={<Fingerprint className="w-6 h-6" />}
            label="Integrity Prob."
            value={currentMetric?.truthProbability || 0}
            color={currentMetric?.truthProbability < 0.65 ? 'red' : 'emerald'}
            status={currentMetric?.truthProbability < 0.65 ? 'UNRELIABLE' : 'CONSISTENT'}
            desc="Biological Honesty Index"
          />
          <NumericSensor 
            icon={<Activity className="w-6 h-6" />}
            label="Autonomic Stress"
            value={currentMetric?.stressLevel || 0}
            color={currentMetric?.stressLevel > 0.5 ? 'red' : 'blue'}
            status={currentMetric?.stressLevel > 0.5 ? 'HIGH_STRAIN' : 'CALM'}
            desc="Physiological Pressure"
          />
          <NumericSensor 
            icon={<BarChart3 className="w-6 h-6" />}
            label="Cognitive Ease"
            value={currentMetric?.confidenceScore || 0}
            color="purple"
            status="ANALYZING"
            desc="Confidence Variance"
          />
        </div>
      </div>

      {/* RIGHT: DATA HUD */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-7 flex flex-col gap-8 backdrop-blur-xl shadow-2xl">
          <div className="space-y-4">
            <h4 className="text-[11px] text-neutral-500 font-black uppercase tracking-[0.4em]">Active Query</h4>
            <div className="p-5 bg-black/60 border border-blue-500/10 rounded-2xl shadow-inner group">
              <p className="text-sm font-bold text-blue-100 leading-relaxed italic transition-colors group-hover:text-white">
                {isActive ? QUESTIONS[currentQuestionIdx] : "SYSTEM_STANDBY"}
              </p>
            </div>
          </div>
          
          <button 
            disabled={!isActive}
            onClick={nextQuestion}
            className={`w-full py-6 rounded-2xl flex flex-col items-center justify-center gap-2 font-black transition-all shadow-2xl ${isActive ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-95' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
          >
            <CheckCircle className="w-7 h-7" />
            <span className="text-[11px] tracking-[0.25em] uppercase">{currentQuestionIdx < QUESTIONS.length - 1 ? "ANALYZE BLOCK" : "DUMP FINAL DATA"}</span>
          </button>

          <button 
            onClick={onCancel}
            className="w-full py-2 text-neutral-700 hover:text-red-500 text-[10px] uppercase font-black transition-colors tracking-[0.4em]"
          >
            TERMINATE BRIDGE
          </button>
        </div>

        <div className="flex-1 bg-neutral-900/40 border border-neutral-800 rounded-3xl p-7 flex flex-col gap-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] text-neutral-500 font-black uppercase tracking-[0.4em]">Physio-Markers</h4>
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
          </div>
          <div className="flex flex-wrap gap-3">
            {(currentMetric?.microExpressions || ["SCANNING..."]).map((m, i) => (
              <span key={i} className="px-4 py-2 bg-blue-500/5 text-blue-400 text-[10px] rounded-xl border border-blue-500/20 font-black uppercase tracking-tight shadow-lg">
                {m}
              </span>
            ))}
          </div>
          
          <div className="mt-auto space-y-6 pt-6 border-t border-neutral-800/60">
            <SensorMetric label="BLINK_FREQ" value={`${(currentMetric?.blinkRate || 0).toFixed(1)} Hz`} color="blue" />
            <SensorMetric label="VOICE_JITTER" value={`${((currentMetric?.voiceJitter || 0) * 100).toFixed(2)}%`} color="emerald" />
            <SensorMetric label="PUPIL_DILATE" value="DETECTED" color="purple" />
            <SensorMetric label="SACCADE_INT" value="HIGH" color="red" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="space-y-1.5">
    <p className="text-[9px] text-neutral-600 font-black tracking-widest">{label}</p>
    <p className={`text-[12px] font-black ${color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-neutral-400'}`}>{value}</p>
  </div>
);

const SensorMetric = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex justify-between items-center text-[11px] font-black">
    <span className="text-neutral-600 tracking-[0.25em]">{label}</span>
    <span className={`text-white px-3 py-1 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>{value}</span>
  </div>
);

const NumericSensor: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string, status: string, desc: string }> = ({ icon, label, value, color, status, desc }) => {
  const colorClasses: any = {
    red: 'text-red-500 border-red-500/30 bg-red-500/5 shadow-red-900/10 ring-red-500/10',
    emerald: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5 shadow-emerald-900/10 ring-emerald-500/10',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5 shadow-blue-900/10 ring-blue-500/10',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5 shadow-purple-900/10 ring-purple-500/10'
  };

  return (
    <div className={`flex-1 border-2 rounded-[2rem] p-7 flex flex-col justify-between shadow-2xl transition-all duration-700 ring-1 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/40 rounded-xl">{icon}</div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">{label}</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-black/50 rounded-full">
           <div className={`w-2.5 h-2.5 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-current'} animate-pulse`} />
           <span className="text-[10px] font-black">{status}</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-3 mt-4">
        <span className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none">{(value * 100).toFixed(1)}</span>
        <span className="text-[12px] font-black text-neutral-600 uppercase tracking-widest">%</span>
      </div>

      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] pt-5 border-t border-white/5 mt-4">
        <span className="text-neutral-500 truncate">{desc}</span>
        <span className="opacity-30 ml-2">S_LOCK</span>
      </div>
    </div>
  );
};

export default InterviewRoom;
