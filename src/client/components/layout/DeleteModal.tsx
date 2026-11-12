import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  conversationTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  conversationTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-status-error/10 text-status-error flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Delete research conversation?
          </h3>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            This will permanently remove{' '}
            {conversationTitle ? <span className="font-medium text-text-primary">"{conversationTitle}"</span> : 'this session'}{' '}
            and its associated sources and cached facts.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-border bg-white hover:bg-background-secondary text-text-secondary text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-lg bg-status-error hover:bg-status-error/90 text-white text-xs font-medium shadow-subtle transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
