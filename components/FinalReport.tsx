
import React from 'react';
import { FileText, Download, RotateCcw, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { InterviewSummary } from '../types';

interface FinalReportProps {
  data: InterviewSummary;
  onReset: () => void;
}

const FinalReport: React.FC<FinalReportProps> = ({ data, onReset }) => {
  const radarData = [
    { subject: 'Confidence', A: 85, fullMark: 100 },
    { subject: 'Clarity', A: 75, fullMark: 100 },
    { subject: 'Honesty', A: data.overallTruthLikelihood * 100, fullMark: 100 },
    { subject: 'Stability', A: (1 - data.averageStress) * 100, fullMark: 100 },
    { subject: 'Focus', A: 90, fullMark: 100 },
  ];

  return (
    <div className="flex-1 bg-black p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Behavioral Integrity Dossier</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Executive Summary</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              New Assessment
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex items-center gap-8 shadow-xl">
            <div className="w-32 h-32 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
              <User className="w-16 h-16 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{data.candidateName}</h2>
                <p className="text-neutral-500 text-sm">Session UID: VRT-8821-X90</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Integrity Score</p>
                  <p className="text-2xl font-bold text-emerald-500">{(data.overallTruthLikelihood * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Stress Benchmark</p>
                  <p className="text-2xl font-bold text-blue-400">{(data.averageStress * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Risk Profile</p>
                  <p className="text-2xl font-bold text-white uppercase">{data.averageStress > 0.4 ? 'Elevated' : 'Stable'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center">
             <div className="w-full h-full min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#404040" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 10 }} />
                  <Radar name="Candidate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Behavioral Strengths
            </h3>
            <ul className="space-y-3">
              {data.keyStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Detection Observations
            </h3>
            <ul className="space-y-3">
              {data.areasOfConcern.length > 0 ? (
                data.areasOfConcern.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {s}
                  </li>
                ))
              ) : (
                <li className="text-neutral-500 text-sm italic">No significant behavioral deviations observed.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Detailed Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Segmented Analysis</h3>
          <div className="space-y-4">
            {data.sessions.map((session, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Question {i+1}</div>
                    <p className="text-lg font-medium text-white">{session.question}</p>
                    <p className="text-sm text-neutral-400 italic font-light">"{session.response}"</p>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="text-center p-3 bg-black/40 rounded-lg min-w-[80px]">
                      <div className="text-[10px] text-neutral-500 uppercase font-bold">Truth</div>
                      <div className="text-sm font-bold text-emerald-500">{(session.analysis.truthProbability * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-center p-3 bg-black/40 rounded-lg min-w-[80px]">
                      <div className="text-[10px] text-neutral-500 uppercase font-bold">Stress</div>
                      <div className="text-sm font-bold text-blue-400">{(session.analysis.stressLevel * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
                {session.riskFlags.length > 0 && (
                  <div className="bg-amber-500/10 px-6 py-2 border-t border-amber-500/20 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] text-amber-500 font-bold uppercase">{session.riskFlags[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-12 border-t border-neutral-900">
           <p className="text-xs text-neutral-600 italic">
            CONFIDENTIAL REPORT - GENERATED BY VERITAS AI (MULTIMODAL BEHAVIORAL ENGINE v2.5)
           </p>
        </div>
      </div>
    </div>
  );
};

export default FinalReport;
