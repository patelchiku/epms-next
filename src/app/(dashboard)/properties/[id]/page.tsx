"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate, parseMobiles, formatPrice } from "@/lib/utils";
import {
  Phone, Edit, Trash2, MapPin, Home, Ruler, Tag,
  DollarSign, User, Key, Car, Calendar
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/properties/${id}`)
      .then((r) => setProperty(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this property?")) return;
    await axios.delete(`/api/properties/${id}`);
    toast.success("Property deleted");
    router.push("/properties");
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (!property) return <div className="p-10 text-center text-slate-400">Property not found</div>;

  const mobiles = parseMobiles(property.otherMobiles);
  const allMobiles = [property.ownerMobile, ...mobiles].filter(Boolean);

  return (
    <div>
      <Header
        title={property.flatNumber ? `Flat ${property.flatNumber}` : "Property Detail"}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Properties", href: "/properties" }, { label: `#${property.id}` }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/properties/${id}/edit`} className="btn-secondary"><Edit className="w-4 h-4" />Edit</Link>
            <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4" />Delete</button>
          </div>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 flex-shrink-0">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">
                    {property.flatNumber ? `Flat ${property.flatNumber}` : "Property"}
                    {property.block && `, Block ${property.block}`}
                  </h2>
                  <span className={`badge ${property.forType === 1 ? "badge-blue" : "badge-orange"}`}>
                    For {property.forType === 1 ? "Rent" : "Sale"}
                  </span>
                  {property.status && <span className="badge badge-green">{property.status.name}</span>}
                </div>
                <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {[property.building?.name, property.area?.name].filter(Boolean).join(", ") || "—"}
                </p>
                {property.address && <p className="text-slate-400 text-xs mt-1">{property.address}</p>}
              </div>
              {property.price && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">₹{formatPrice(property.price)}</p>
                  <p className="text-xs text-slate-400">Asking price</p>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Tag, label: "Type", value: property.propertyType?.name },
                { icon: Tag, label: "Segment", value: property.segment?.name },
                { icon: Tag, label: "BHK/Office", value: property.bhkOffice?.name },
                { icon: Ruler, label: "Super Built-up", value: property.superBuiltUp ? `${property.superBuiltUp} sq.ft` : null },
                { icon: Ruler, label: "Carpet Area", value: property.carpet ? `${property.carpet} sq.ft` : null },
                { icon: Ruler, label: "Construction", value: property.constructionArea ? `${property.constructionArea} sq.ft` : null },
                { icon: Ruler, label: "Measurement", value: property.measurement?.name },
                { icon: Home, label: "Furniture", value: property.furniture?.name },
                { icon: Car, label: "Parking", value: property.parking },
                { icon: Key, label: "Key Status", value: property.keyStatus },
                { icon: Calendar, label: "Available From", value: property.availableFrom ? formatDate(property.availableFrom) : null },
                { icon: Tag, label: "Source", value: property.source?.name },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ) : null)}
            </div>
            {property.remark && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Remark</p>
                <p className="text-sm text-slate-700">{property.remark}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Owner Details</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{property.ownerName || "—"}</p>
                {property.ownerMobile && (
                  <a href={`tel:${property.ownerMobile}`} className="text-xs text-violet-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />{property.ownerMobile}
                  </a>
                )}
              </div>
            </div>
            {allMobiles.length > 0 && (
              <div className="space-y-2">
                {allMobiles.map((m: string) => (
                  <a key={m} href={`https://api.whatsapp.com/send?phone=91${m}`} target="_blank"
                    className="flex items-center gap-2 w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp {m}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Pricing</h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Price" value={property.price ? `₹${formatPrice(property.price)}` : "—"} highlight />
              <InfoRow label="Commission" value={property.commission || "—"} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Property Info</h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Property ID" value={`#${property.id}`} />
              <InfoRow label="Added On" value={formatDate(property.addedAt)} />
              <InfoRow label="Added By" value={property.user ? `${property.user.firstName} ${property.user.lastName}` : "—"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`font-semibold ${highlight ? "text-emerald-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
