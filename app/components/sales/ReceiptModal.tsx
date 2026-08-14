"use client";

import React from "react";
import { CheckCircle2, Printer, Plus } from "lucide-react";

interface ReceiptModalProps {
  saleId: number;
  currency: string;
  onNewSale: () => void;
  onPrint: () => void;
}

export default function ReceiptModal({ saleId, currency, onNewSale, onPrint }: ReceiptModalProps) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="success-icon-wrap">
          <CheckCircle2 size={52} className="success-icon" />
        </div>
        <h2>Sale Complete!</h2>
        <p className="sale-ref">Sale #{saleId}</p>
        <p className="subtitle">The transaction has been recorded successfully.</p>

        <div className="actions">
          <button className="print-btn" onClick={onPrint}>
            <Printer size={16} /> Print Receipt
          </button>
          <button className="new-btn" onClick={() => {
              onNewSale();
              window.location.reload(); 
            }}>
            <Plus size={16} /> New Sale
          </button>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.6);
          backdrop-filter: blur(6px); z-index: 60;
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .modal {
          background: #fff; border-radius: 20px; padding: 2.5rem 2rem;
          max-width: 360px; width: 100%; text-align: center;
          box-shadow: 0 32px 80px rgba(0,0,0,0.2);
          animation: pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .success-icon-wrap {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.2rem;
        }
        :global(.success-icon) { color: #059669; }

        h2 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem; }
        .sale-ref { font-size: 0.82rem; color: #6366f1; font-weight: 700; font-family: monospace; margin: 0 0 0.5rem; }
        .subtitle { font-size: 0.85rem; color: #94a3b8; margin: 0 0 1.5rem; }

        .actions { display: flex; gap: 0.75rem; justify-content: center; }
        .print-btn {
          flex: 1; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #fff;
          color: #475569; font-size: 0.85rem; font-weight: 600; padding: 0.65rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.12s;
        }
        .print-btn:hover { background: #f8fafc; }
        .new-btn {
          flex: 1; border: none; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 0.85rem; font-weight: 700; padding: 0.65rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3); transition: opacity 0.12s;
        }
        .new-btn:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}