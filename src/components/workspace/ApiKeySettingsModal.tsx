import React, { useState } from 'react';
import { Key, ShieldCheck, Check, Trash2, ExternalLink } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useEventContext } from '../../context/EventContext';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { apiKey, updateApiKey } = useEventContext();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    updateApiKey('');
    setKeyInput('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Gemini AI Integration"
      subtitle="Connect your Google AI Studio Gemini API key to enable live model intelligence."
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-900 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
          <div>
            <strong>Client-Side Security Notice:</strong> Your API key is stored strictly in your browser's local session storage. It is transmitted directly to Google's Generative AI endpoint and is never saved to external servers or logged.
          </div>
        </div>

        <div>
          <label htmlFor="gemini-api-key" className="block text-xs font-semibold text-stone-dark mb-1">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              id="gemini-api-key"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-border text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-gold-300"
            />
            <Key className="w-4 h-4 text-stone-muted absolute right-3 top-3 pointer-events-none" />
          </div>
          <p className="mt-1.5 text-xs text-stone-muted">
            Don't have a key?{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:underline font-medium inline-flex items-center gap-0.5"
            >
              Get one free from Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Settings updated successfully!
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-stone-border">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Key (Use Demo Mode)
            </button>
          ) : (
            <span className="text-xs text-stone-muted">Demo mode active by default</span>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
