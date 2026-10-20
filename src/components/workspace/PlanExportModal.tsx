import React, { useState } from 'react';
import {
  Printer,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useEventContext } from '../../context/EventContext';
import { exportEventsJson, importEventsJson } from '../../services/storage';

interface PlanExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanExportModal: React.FC<PlanExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { events, activeEvent, resetAllToSamples } = useEventContext();
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'export' | 'import' | 'reset'>('export');

  if (!activeEvent) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const jsonStr = exportEventsJson(events);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gatherly-plan-${activeEvent.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const summaryText = `GATHERLY CELEBRATION PLAN: ${activeEvent.name}
Type: ${activeEvent.type.toUpperCase()}
Date: ${activeEvent.date}
Guest Count: ${activeEvent.guestCount}
Budget Limit: ${activeEvent.totalBudget} ${activeEvent.currency}
Location: ${activeEvent.location || 'N/A'}
Theme: ${activeEvent.theme || 'N/A'}

BUDGET BREAKDOWN (${activeEvent.budgetItems.length} items):
${activeEvent.budgetItems.map((b) => `- ${b.name}: Planned ${b.plannedAmount} ${activeEvent.currency} (${b.category})`).join('\n')}

TIMELINE MILESTONES (${activeEvent.timeline.length} items):
${activeEvent.timeline.map((t) => `- [${t.completed ? 'X' : ' '}] Due ${t.dueDate}: ${t.title}`).join('\n')}

VENDORS CHECKLIST (${activeEvent.vendorChecklist.length} items):
${activeEvent.vendorChecklist.map((v) => `- ${v.title} [Status: ${v.status}]: ${v.vendorName || 'Unassigned'}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      setImportError('Please paste valid JSON content.');
      return;
    }

    const imported = importEventsJson(importJsonText.trim());
    if (!imported) {
      setImportError('Invalid plan JSON format. Ensure all mandatory fields (id, name, type, date, budgetItems, timeline, vendorChecklist) are present.');
      return;
    }

    // Success: reload window or trigger refresh
    localStorage.setItem('gatherly_events_v1', JSON.stringify(imported));
    window.location.reload();
  };

  const handleExecuteReset = () => {
    resetAllToSamples();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan Sharing & Data Management"
      subtitle="Export print-ready itineraries, backup JSON, or reset plans."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Sub Navigation */}
        <div className="flex border-b border-stone-border">
          <button
            onClick={() => setActiveSubTab('export')}
            className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSubTab === 'export'
                ? 'border-forest-700 text-forest-900'
                : 'border-transparent text-stone-muted hover:text-stone-dark'
            }`}
          >
            Export & Print
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSubTab === 'import'
                ? 'border-forest-700 text-forest-900'
                : 'border-transparent text-stone-muted hover:text-stone-dark'
            }`}
          >
            Import JSON
          </button>
          <button
            onClick={() => setActiveSubTab('reset')}
            className={`pb-2.5 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeSubTab === 'reset'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-muted hover:text-rose-600'
            }`}
          >
            Reset Data
          </button>
        </div>

        {/* Tab 1: Export & Print */}
        {activeSubTab === 'export' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handlePrint}
                className="p-4 rounded-xl border border-stone-border hover:border-forest-600 bg-white hover:bg-forest-50/40 text-left transition-all flex flex-col justify-between group"
              >
                <div className="p-2 rounded-lg bg-cream-100 text-forest-800 w-fit mb-2 group-hover:bg-forest-100">
                  <Printer className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-forest-900">Print / PDF</h4>
                <p className="text-[11px] text-stone-muted mt-0.5">
                  Print clean layout or save as PDF
                </p>
              </button>

              <button
                onClick={handleDownloadJson}
                className="p-4 rounded-xl border border-stone-border hover:border-gold-500 bg-white hover:bg-gold-50/40 text-left transition-all flex flex-col justify-between group"
              >
                <div className="p-2 rounded-lg bg-cream-100 text-gold-700 w-fit mb-2 group-hover:bg-gold-100">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-forest-900">Download JSON</h4>
                <p className="text-[11px] text-stone-muted mt-0.5">
                  Full backup of all events
                </p>
              </button>

              <button
                onClick={handleCopySummary}
                className="p-4 rounded-xl border border-stone-border hover:border-forest-600 bg-white hover:bg-forest-50/40 text-left transition-all flex flex-col justify-between group"
              >
                <div className="p-2 rounded-lg bg-cream-100 text-forest-800 w-fit mb-2 group-hover:bg-forest-100">
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </div>
                <h4 className="font-serif font-bold text-sm text-forest-900">
                  {copied ? 'Copied!' : 'Copy Summary'}
                </h4>
                <p className="text-[11px] text-stone-muted mt-0.5">
                  Formatted text for email / chats
                </p>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-100 text-xs text-stone-dark leading-relaxed">
              <strong>Print Tip:</strong> When using the browser print dialogue, choose "Save as PDF" and enable "Background Graphics" for optimal visual fidelity.
            </div>
          </div>
        )}

        {/* Tab 2: Import JSON */}
        {activeSubTab === 'import' && (
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <p className="text-xs text-stone-muted">
              Paste a previously exported Gatherly JSON file to restore your celebration plans.
            </p>
            {importError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {importError}
              </p>
            )}
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "id": "...", "name": "...", "budgetItems": [...] } ]'
              className="w-full text-xs font-mono p-3 bg-white border border-stone-border rounded-xl focus:ring-2 focus:ring-gold-400"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                <Upload className="w-3.5 h-3.5" /> Restore Plan
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Reset */}
        {activeSubTab === 'reset' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-xs sm:text-sm leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Destructive Action: Reset to Sample Celebrations
              </div>
              This will reset all event plans back to the 3 curated showcase celebrations (Botanical Wedding, 30th Birthday Bash, and Harvest Community Festival). Any custom changes you made will be replaced.
            </div>

            {showResetConfirm ? (
              <div className="p-4 rounded-xl border border-stone-border bg-white space-y-3">
                <p className="text-xs font-semibold text-stone-dark">
                  Are you absolutely certain you wish to proceed?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" onClick={handleExecuteReset}>
                    Yes, Reset Everything
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowResetConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Proceed to Reset Data
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
