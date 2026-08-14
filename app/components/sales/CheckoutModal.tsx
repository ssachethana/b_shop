"use client";

import React, { useState, useTransition } from "react";
import { X, CreditCard, Banknote, ArrowLeftRight, MoreHorizontal, CheckCircle2, Loader2, UserRound } from "lucide-react";
import type { PaymentMethod } from "../../types/sales";
import { useCart } from "./CartContext";


interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: (saleId: number) => void;
  shopId: number;
  cashierId?: number;
  currency: string;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; Icon: React.ElementType }[] = [
  { value: "CASH", label: "Cash", Icon: Banknote },
  { value: "CARD", label: "Card", Icon: CreditCard },
  { value: "TRANSFER", label: "Transfer", Icon: ArrowLeftRight },
  { value: "OTHER", label: "Other", Icon: MoreHorizontal },
];

export default function CheckoutModal({
  onClose,
  onSuccess,
  shopId,
  cashierId,
  currency,
}: CheckoutModalProps) {
  const { state, total, change, subtotal, cartDiscount, setPaymentMethod, setAmountReceived, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState(total.toFixed(2));

  function handleAmountChange(val: string) {
    setInputVal(val);
    const n = parseFloat(val);
    if (!isNaN(n)) setAmountReceived(n);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          shopId,
          cashierId,
          customerId: state.customerId ?? undefined,
          paymentMethod: state.paymentMethod,
          totalAmount: total,
          amountReceived: state.amountReceived,
          items: state.items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            price: i.unitPrice,
            costAtSale: i.selectedBatch?.costPerUnit ?? 0,
            batchId:i.selectedBatch?.id,
          })),
        };

        console.log(payload)
        console.log("mama methana")

        const res = await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to process sale");

        clear();
        onSuccess(data.sale.id);
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Confirm Sale</h2>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Customer */}
        {state.customerName && (
          <div className="customer-row">
            <UserRound size={14} />
            <span>{state.customerName}</span>
          </div>
        )}

        {/* Order summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal ({state.items.length} items)</span>
            <span>{currency} {subtotal.toFixed(2)}</span>
          </div>
          {cartDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>− {currency} {cartDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total-row">
            <span>Total Due</span>
            <span>{currency} {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="section-label">Payment Method</div>
        <div className="method-grid">
          {PAYMENT_METHODS.map(({ value, label, Icon }) => (
            <button
              key={value}
              className={`method-btn ${state.paymentMethod === value ? "active" : ""}`}
              onClick={() => setPaymentMethod(value)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Amount received (cash only makes sense, but show for all) */}
        {state.paymentMethod === "CASH" && (
          <div className="amount-block">
            <label className="section-label">Amount Received</label>
            <div className="amount-input-wrap">
              <span className="currency-prefix">{currency}</span>
              <input
                type="number"
                className="amount-input"
                value={inputVal}
                min={0}
                step="0.01"
                onChange={(e) => handleAmountChange(e.target.value)}
              />
            </div>
            {change > 0 && (
              <div className="change-notice">
                Change: <strong>{currency} {change.toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {/* Actions */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={handleSubmit}
            disabled={isPending || state.items.length === 0}
          >
            {isPending ? (
              <><Loader2 size={16} className="spin" /> Processing…</>
            ) : (
              <><CheckCircle2 size={16} /> Confirm {currency} {total.toFixed(2)}</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.55);
          backdrop-filter: blur(4px); z-index: 50;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .modal {
          background: #fff; border-radius: 18px; width: 100%; max-width: 440px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18); overflow: hidden;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.2rem 1.4rem 1rem;
        }
        .modal-header h2 { font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0; }
        .close-btn {
          border: none; background: #f1f5f9; border-radius: 8px; padding: 6px;
          cursor: pointer; color: #64748b; display: flex; align-items: center;
        }

        .customer-row {
          display: flex; align-items: center; gap: 6px;
          margin: 0 1.4rem 0.8rem; padding: 0.5rem 0.75rem;
          background: #f0fdf4; border-radius: 8px; font-size: 0.82rem;
          color: #166534; font-weight: 600;
        }

        .order-summary {
          background: #f8fafc; margin: 0 1.4rem; border-radius: 12px;
          padding: 0.8rem 1rem; display: flex; flex-direction: column; gap: 0.45rem;
        }
        .summary-row {
          display: flex; justify-content: space-between;
          font-size: 0.85rem; color: #475569;
        }
        .summary-row.discount { color: #16a34a; }
        .summary-row.total-row {
          font-size: 1rem; font-weight: 800; color: #0f172a;
          padding-top: 0.45rem; border-top: 1.5px solid #e2e8f0; margin-top: 0.15rem;
        }

        .section-label {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: #9ca3af;
          padding: 0.9rem 1.4rem 0.4rem;
        }

        .method-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem; padding: 0 1.4rem;
        }
        .method-btn {
          border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
          padding: 0.55rem 0.3rem; display: flex; flex-direction: column;
          align-items: center; gap: 4px; cursor: pointer; font-size: 0.72rem;
          font-weight: 600; color: #64748b; transition: all 0.12s;
        }
        .method-btn:hover { border-color: #F5A623; color: #F5A623; }
        .method-btn.active { border-color: #F5A623; background: #eef2ff; color: #F5A623; }

        .amount-block { padding: 0.5rem 1.4rem 0; }
        .amount-input-wrap {
          display: flex; align-items: center; border: 1.5px solid #e2e8f0;
          border-radius: 10px; overflow: hidden; background: #f8fafc;
          margin-top: 0.35rem;
        }
        .amount-input-wrap:focus-within { border-color: #6366f1; background: #fff; }
        .currency-prefix {
          padding: 0.55rem 0.75rem; font-size: 0.85rem; color: #9ca3af;
          background: #f1f5f9; font-weight: 600; border-right: 1px solid #e2e8f0;
        }
        .amount-input {
          border: none; background: transparent; padding: 0.55rem 0.75rem;
          font-size: 1rem; font-weight: 700; color: #1e293b; outline: none; width: 100%;
        }
        .change-notice {
          margin-top: 0.4rem; font-size: 0.82rem; color: #475569;
          background: #f0fdf4; border-radius: 8px; padding: 0.4rem 0.75rem;
        }
        .change-notice strong { color: #16a34a; }

        .error-box {
          margin: 0.6rem 1.4rem; background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.8rem; color: #dc2626;
        }

        .modal-footer {
          display: flex; gap: 0.75rem; padding: 1rem 1.4rem 1.4rem;
        }
        .cancel-btn {
          flex: 1; border: 1.5px solid #e2e8f0; border-radius: 12px;
          background: #fff; color: #64748b; font-size: 0.9rem; font-weight: 600;
          padding: 0.7rem; cursor: pointer; transition: all 0.12s;
        }
        .cancel-btn:hover { background: #f8fafc; }
        .confirm-btn {
          flex: 2; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #F5A623, #F5A623);
          color: #fff; font-size: 0.9rem; font-weight: 700;
          padding: 0.7rem; cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 0.4rem;
          transition: opacity 0.12s; box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        :global(.spin) { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}