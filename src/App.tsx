import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import UploadCenter from './views/UploadCenter';
import EvidenceSummary from './views/EvidenceSummary';
import VerdictReport from './views/VerdictReport';
import SubmissionGuide from './views/SubmissionGuide';
import Profile from './views/Profile';
import History from './views/History';
import Advocate from './views/Advocate';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flowStep, setFlowStep] = useState<'none' | 'summary' | 'verdict' | 'submission'>('none');
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  const handleStartAppeal = () => {
    setActiveTab('upload');
  };

  const handleSubmitUpload = (caseId?: string) => {
    if (caseId) setCurrentCaseId(caseId);
    setFlowStep('summary');
  };

  const handleFinalizeVerdict = () => {
    setFlowStep('verdict');
  };

  const handleStartSubmission = () => {
    setFlowStep('submission');
  };

  const renderContent = () => {
    if (activeTab === 'upload') {
      if (flowStep === 'summary') {
        return <EvidenceSummary caseId={currentCaseId} onFinalize={handleFinalizeVerdict} />;
      }
      if (flowStep === 'verdict') {
        return <VerdictReport caseId={currentCaseId} onSubmit={handleStartSubmission} />;
      }
      if (flowStep === 'submission') {
        return <SubmissionGuide />;
      }
      return <UploadCenter onSubmit={handleSubmitUpload} />;
    }

    if (activeTab === 'history') {
      return <History />;
    }

    if (activeTab === 'profile') {
      return <Profile />;
    }

    if (activeTab === 'chat') {
      return <Advocate onBack={() => setActiveTab('dashboard')} />;
    }

    return (
      <Dashboard onStartAppeal={handleStartAppeal} onOpenChat={() => setActiveTab('chat')} />
    );
  };


  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'upload') setFlowStep('none');
      }}
    >
      {renderContent()}
    </Layout>
  );
}
