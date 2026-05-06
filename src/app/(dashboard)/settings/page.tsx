"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Save, ExternalLink, KeyRound, Globe } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type Settings = {
  mb_api_key: string;
  acres_api_url: string;
  acres_username: string;
  acres_password: string;
  housing_api_key: string;
  housing_project_id: string;
};

const EMPTY: Settings = {
  mb_api_key: "",
  acres_api_url: "",
  acres_username: "",
  acres_password: "",
  housing_api_key: "",
  housing_project_id: "",
};

export default function SettingsPage() {
  const [values, setValues] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async (attempt = 0) => {
      try {
        const res = await axios.get("/api/settings");
        setValues({ ...EMPTY, ...res.data });
        setLoading(false);
      } catch {
        if (attempt < 2) setTimeout(() => load(attempt + 1), 1500);
        else { toast.error("Failed to load settings"); setLoading(false); }
      }
    };
    load();
  }, []);

  function set(key: keyof Settings, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function save(section: Partial<Settings>) {
    setSaving(true);
    try {
      await axios.put("/api/settings", section);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header
        title="Settings"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="p-6 space-y-6 max-w-3xl">

        {/* MagicBricks */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">MagicBricks</h2>
              <p className="text-xs text-slate-400">Lead import via MagicBricks rating API</p>
            </div>
            <a
              href="http://rating.magicbricks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-slate-400 hover:text-violet-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div>
            <label className="label">API Key</label>
            {loading ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <input
                value={values.mb_api_key}
                onChange={(e) => set("mb_api_key", e.target.value)}
                placeholder="e.g. VQ~~~~~~2F0F3rpi9Eg5K70nq..."
                className="input font-mono text-xs"
              />
            )}
            <p className="text-xs text-slate-400 mt-1">
              Used as the <code className="bg-slate-100 px-1 rounded">key=</code> parameter in the download URL.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => save({ mb_api_key: values.mb_api_key })}
              disabled={saving || loading}
              className="btn-primary"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </section>

        {/* 99acres */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">99acres</h2>
              <p className="text-xs text-slate-400">Lead import via 99acres API</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">API URL</label>
              {loading ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <input
                  value={values.acres_api_url}
                  onChange={(e) => set("acres_api_url", e.target.value)}
                  placeholder="https://www.99acres.com/99api/v1/..."
                  className="input font-mono text-xs"
                />
              )}
            </div>
            <div>
              <label className="label">Username</label>
              {loading ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <input
                  value={values.acres_username}
                  onChange={(e) => set("acres_username", e.target.value)}
                  placeholder="e.g. Topspace@99"
                  className="input"
                />
              )}
            </div>
            <div>
              <label className="label">Password</label>
              {loading ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <input
                  type="password"
                  value={values.acres_password}
                  onChange={(e) => set("acres_password", e.target.value)}
                  placeholder="••••••••"
                  className="input"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => save({ acres_api_url: values.acres_api_url, acres_username: values.acres_username, acres_password: values.acres_password })}
              disabled={saving || loading}
              className="btn-primary"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </section>

        {/* Housing.com */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Housing.com</h2>
              <p className="text-xs text-slate-400">Lead import via Housing.com builder API</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">API Key (HMAC secret)</label>
              {loading ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <input
                  value={values.housing_api_key}
                  onChange={(e) => set("housing_api_key", e.target.value)}
                  placeholder="e.g. bf6af5e14254c549..."
                  className="input font-mono text-xs"
                />
              )}
            </div>
            <div>
              <label className="label">Project ID</label>
              {loading ? (
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <input
                  value={values.housing_project_id}
                  onChange={(e) => set("housing_project_id", e.target.value)}
                  placeholder="e.g. 6719041"
                  className="input"
                />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            The API key is used as the HMAC-SHA256 secret to sign the request timestamp.
          </p>

          <div className="flex justify-end">
            <button
              onClick={() => save({ housing_api_key: values.housing_api_key, housing_project_id: values.housing_project_id })}
              disabled={saving || loading}
              className="btn-primary"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
