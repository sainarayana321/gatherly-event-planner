import React, { useState } from 'react';
import { EventProvider } from './context/EventContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { EventOverview } from './components/workspace/EventOverview';
import { BudgetPlanner } from './components/workspace/BudgetPlanner';
import { TimelineView } from './components/workspace/TimelineView';
import { VendorChecklist } from './components/workspace/VendorChecklist';
import { AiAssistant } from './components/workspace/AiAssistant';
import { EventCreationModal } from './components/creation/EventCreationModal';
import { PlanExportModal } from './components/workspace/PlanExportModal';
import { ApiKeySettingsModal } from './components/workspace/ApiKeySettingsModal';

type WorkspaceTab = 'overview' | 'budget' | 'timeline' | 'vendors' | 'assistant';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('overview');
  const [showLanding, setShowLanding] = useState<boolean>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-stone-dark">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        showLanding={showLanding}
        onToggleLanding={() => setShowLanding(!showLanding)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {showLanding ? (
          <LandingPage
            onEnterWorkspace={() => setShowLanding(false)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div>
            {currentTab === 'overview' && (
              <EventOverview onNavigateTab={setCurrentTab} />
            )}
            {currentTab === 'budget' && <BudgetPlanner />}
            {currentTab === 'timeline' && <TimelineView />}
            {currentTab === 'vendors' && <VendorChecklist />}
            {currentTab === 'assistant' && (
              <AiAssistant onOpenSettingsModal={() => setIsSettingsModalOpen(true)} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <EventCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setShowLanding(false);
          setCurrentTab('overview');
        }}
      />

      <PlanExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ApiKeySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <EventProvider>
      <MainContent />
    </EventProvider>
  );
}

export default App;
