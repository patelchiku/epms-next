"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, Home, X, Plus } from "lucide-react";

type EnquiryResult = {
  id: number;
  clientName: string;
  mobileNos: string;
  email: string | null;
  forType: number;
};

type PropertyResult = {
  id: number;
  ownerName: string | null;
  ownerMobile: string | null;
  address: string | null;
  flatNumber: string | null;
  forType: number;
};

type SearchResults = {
  enquiries: EnquiryResult[];
  properties: PropertyResult[];
};

export default function UniversalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasResults =
    results && (results.enquiries.length > 0 || results.properties.length > 0);
  const noResults =
    results &&
    results.enquiries.length === 0 &&
    results.properties.length === 0;

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResults = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => fetchResults(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  }

  function clear() {
    setQuery("");
    setResults(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results && query.length >= 2) setOpen(true);
          }}
          placeholder="Search by mobile, email or name…"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 pl-9 pr-8 py-2 focus:outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 w-3.5 h-3.5 text-slate-400 animate-spin" />
        )}
        {!loading && query.length > 0 && (
          <button
            onClick={clear}
            className="absolute right-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-[440px] overflow-y-auto">
          {hasResults ? (
            <>
              {results!.enquiries.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                    Leads / Enquiries
                  </p>
                  {results!.enquiries.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/enquiries/${e.id}`)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-violet-50 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {e.clientName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {e.mobileNos.split(",")[0].trim()}
                          {e.email ? ` · ${e.email}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 flex-shrink-0">
                        #{e.id}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results!.properties.length > 0 && (
                <div
                  className={
                    results!.enquiries.length > 0
                      ? "border-t border-slate-100"
                      : ""
                  }
                >
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                    Properties
                  </p>
                  {results!.properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/properties/${p.id}`)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-violet-50 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {p.ownerName || "Unknown Owner"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {[p.ownerMobile, p.address, p.flatNumber ? `Flat ${p.flatNumber}` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 flex-shrink-0">
                        #{p.id}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : noResults ? (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">
                No results for "{query}"
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try a different mobile number, email or name
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => navigate("/enquiries/add")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Enquiry
                </button>
                <button
                  onClick={() => navigate("/properties/add")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Property
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
