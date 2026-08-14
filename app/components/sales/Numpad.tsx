"use client";

import React from "react";
import { Delete, CornerDownLeft } from "lucide-react";
import { useCart } from "./CartContext";

interface NumpadProps {
  currency: string;
}

export default function Numpad({ currency }: NumpadProps) {
  const { state, setAmountReceived, total, change } = useCart();
  const [input, setInput] = React.useState("");

  const display = input === "" ? "0" : input;

  function press(key: string) {
  if (key === "." && input.includes(".")) return;
  if (key === "00" && input === "") return;

  const next = input + key;
  const val = parseFloat(next);

  setInput(next);
  if (!isNaN(val)) setAmountReceived(val);
}

function backspace() {
  const next = input.slice(0, -1);
  const val = parseFloat(next);

  setInput(next);
  setAmountReceived(isNaN(val) ? 0 : val);
}

  function cancel() {
    setInput("");
    setAmountReceived(0);
  }

  function exact() {
    const str = total.toFixed(2);
    setInput(str);
    setAmountReceived(total);
  }

  const KEYS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["00", "0", "."],
  ];

  return (
    <div className="numpad-wrapper">
      {/* Payment summary */}
      <div className="pay-summary">
        <div className="pay-row">
          <span>Payment Due</span>
          <span className="pay-val">{currency} {total.toFixed(2)}</span>
        </div>
        <div className="pay-row">
          <span>Received</span>
          <span className="pay-val received">{currency} {parseFloat(display).toFixed(2)}</span>
        </div>
        <div className="pay-row change-row">
          <span>Change</span>
          <span className={`pay-val ${change > 0 ? "change-pos" : ""}`}>
            {currency} {change.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Digit display */}
      <div className="digit-display">
        <span className="currency-label">{currency}</span>
        <span className="digit-value">{display}</span>
      </div>

      {/* Grid */}
      <div className="key-grid">
        {KEYS.map((row, ri) => (
          <React.Fragment key={ri}>
            {row.map((k) => (
              <button key={k} className="numkey" onClick={() => press(k)}>
                {k}
              </button>
            ))}
            {ri === 0 && (
              <button className="numkey action-key cancel-key" onClick={cancel}>
                Cancel
              </button>
            )}
            {ri === 1 && (
              <button className="numkey action-key delete-key" onClick={backspace}>
                <Delete size={18} />
              </button>
            )}
            {ri === 2 && (
              <button className="numkey action-key exact-key" onClick={exact}>
                Exact
              </button>
            )}
            {ri === 3 && (
              <button className="numkey action-key enter-key wide-key">
                <CornerDownLeft size={18} />
                Enter
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <style jsx>{`
        .numpad-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          height: 100%;
        }
        .pay-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .pay-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #555;
        }
        .pay-val { font-weight: 600; color: #222; }
        .received { color: #1a7f5a; }
        .change-row { padding-top: 0.35rem; border-top: 1px solid #e5e7eb; }
        .change-pos { color: #2563eb; }

        .digit-display {
          background: #111827;
          border-radius: 10px;
          padding: 0.6rem 1rem;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .currency-label { color: #6b7280; font-size: 0.85rem; font-family: monospace; }
        .digit-value { color: #fff; font-size: 1.6rem; font-family: monospace; font-weight: 700; letter-spacing: 0.04em; }

        .key-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
          flex: 1;
        }
        .numkey {
          border: none;
          border-radius: 10px;
          background: #f1f5f9;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: background 0.12s, transform 0.08s;
          padding: 0.65rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          min-height: 48px;
        }
        .numkey:active { transform: scale(0.94); background: #e2e8f0; }
        .action-key { font-size: 0.82rem; }
        .cancel-key { background: #fef2f2; color: #991b1b; }
        .cancel-key:active { background: #fee2e2; }
        .delete-key { background: #fff7ed; color: #c2410c; }
        .delete-key:active { background: #fed7aa; }
        .exact-key { background: #f0fdf4; color: #166534; }
        .exact-key:active { background: #dcfce7; }
        .enter-key { background: #22c55e; color: #fff; font-size: 0.82rem; font-weight: 700; }
        .enter-key:active { background: #16a34a; }
        .wide-key { grid-column: span 1; }
      `}</style>
    </div>
  );
}