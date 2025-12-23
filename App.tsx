
import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import InterviewRoom from './components/InterviewRoom';
import FinalReport from './components/FinalReport';
import { AppState, InterviewSummary } from './types';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppState>(AppState.LANDING);
  const [interviewData, setInterviewData] = useState<InterviewSummary | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string>("");

  const startInterview = useCallback((url: string) => {
    setMeetingUrl(url);
    setCurrentStep(AppState.INTERVIEW);
  }, []);

  const finishInterview = useCallback((data: InterviewSummary) => {
    setInterviewData({ ...data, meetingUrl });
    setCurrentStep(AppState.REPORT);
  }, [meetingUrl]);

  const resetApp = useCallback(() => {
    setInterviewData(null);
    setMeetingUrl("");
    setCurrentStep(AppState.LANDING);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-500/30">
      {currentStep === AppState.LANDING && (
        <LandingPage onStart={startInterview} />
      )}
      
      {currentStep === AppState.INTERVIEW && (
        <InterviewRoom 
          onComplete={finishInterview} 
          onCancel={resetApp} 
          meetingUrl={meetingUrl} 
        />
      )}

      {currentStep === AppState.REPORT && interviewData && (
        <FinalReport data={interviewData} onReset={resetApp} />
      )}
    </div>
  );
};

export default App;
