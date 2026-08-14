"use client";

import React, { useRef, useState } from "react";
import { ScanBarcode, Loader2 } from "lucide-react";
import { useCart } from "./CartContext";
import type { Product } from "../../types/sales";

interface ScannerInputProps {
  shopId: number;
  currency: string;
}

export default function ScannerInput({ shopId, currency }: ScannerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState("");

  async function lookup(code: string) {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sales/scan?shopId=${shopId}&code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Not found");
      addItem(data.product as Product);
      setValue("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="scanner-wrap">
      <div className={`scanner-bar ${error ? "has-error" : ""}`}>
        <ScanBarcode size={17} className="scan-icon" />
        <input
          ref={inputRef}
          className="scan-input"
          placeholder="Scan barcode or enter SKU…"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") lookup(value); }}
          autoFocus
        />
        {isLoading && <Loader2 size={16} className="spin" />}
        {value && !isLoading && (
          <button className="go-btn" onClick={() => lookup(value)}>Go</button>
        )}
      </div>
      {error && <span className="err-msg">{error}</span>}

      <style jsx>{`
        .scanner-wrap { display: flex; flex-direction: column; gap: 3px; }
        .scanner-bar {
          display: flex; align-items: center; gap: 0.5rem;
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 0 0.75rem; transition: border-color 0.12s;
        }
        .scanner-bar:focus-within { border-color: #6366f1; }
        .scanner-bar.has-error { border-color: #fca5a5; }
        :global(.scan-icon) { color: #94a3b8; flex-shrink: 0; }
        .scan-input {
          flex: 1; border: none; background: transparent; outline: none;
          padding: 0.5rem 0; font-size: 0.82rem; color: #1e293b;
          font-family: monospace;
        }
        :global(.spin) { animation: spin 0.8s linear infinite; color: #6366f1; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .go-btn {
          border: none; background: #6366f1; color: #fff; border-radius: 6px;
          font-size: 0.72rem; font-weight: 700; padding: 3px 8px; cursor: pointer;
        }
        .err-msg { font-size: 0.72rem; color: #dc2626; padding-left: 0.75rem; }
      `}</style>
    </div>
  );
}