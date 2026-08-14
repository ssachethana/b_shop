"use client";
import { useSession } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const CURRENCIES = [
  "LKR",
  "USD",
  
];

export default function NewShopPage() {
  const router = useRouter();
  const { update } = useSession(); // Extracted update function

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. You can enter it manually.");
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currency,
          location: location || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (data.fields) setFieldErrors(data.fields);
        return;
      }

      // --- CRITICAL SESSION UPDATE HERE ---
      // Your backend returns { shop: { id, name, ... } }
      if (data.shop) {
        await update({
          shopId: data.shop.id,
          shopName: data.shop.name,
        });
      }
      // ------------------------------------

      router.push(`/pages/dashboard`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Create a new shop</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set up a shop to start tracking products, sales, and inventory.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Shop name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="e.g. Riverside Mini Mart"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
              Location <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="latitude,longitude"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {locating ? "Locating…" : "Use current"}
              </button>
            </div>
            {fieldErrors.location && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.location[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || name.trim().length < 2}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Creating shop…" : "Create shop"}
          </button>
        </form>
      </div>
    </div>
  );
}