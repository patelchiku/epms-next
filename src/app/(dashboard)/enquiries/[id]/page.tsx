"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate, formatDateTime, parseMobiles } from "@/lib/utils";
import {
  Phone, Mail, Calendar, Edit, Trash2, MessageSquare,
  Send, Loader2, User, Tag, MapPin, DollarSign, Clock
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ remark: string; activityId?: number; nfd?: string }>();

  useEffect(() => {
    Promise.all([
      axios.get(`/api/enquiries/${id}`),
      axios.get("/api/master/activities"),
    ]).then(([eq, act]) => {
      setEnquiry(eq.data);
      setActivities(act.data);
    }).catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function postComment(data: any) {
    setPosting(true);
    try {
      const res = await axios.post(`/api/enquiries/${id}/comments`, data);
      setEnquiry((prev: any) => ({
        ...prev,
        comments: [res.data.data, ...prev.comments],
        nfd: data.nfd ? new Date(data.nfd) : prev.nfd,
      }));
      reset();
      toast.success("Follow-up added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this enquiry?")) return;
    await axios.delete(`/api/enquiries/${id}`);
    toast.success("Deleted");
    router.push("/enquiries");
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (!enquiry) return <div className="p-10 text-center text-slate-400">Enquiry not found</div>;

  const mobiles = parseMobiles(enquiry.mobileNos);

  return (
    <div>
      <Header
        title={enquiry.clientName}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enquiries", href: "/enquiries" }, { label: enquiry.clientName }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/enquiries/${id}/edit`} className="btn-secondary"><Edit className="w-4 h-4" />Edit</Link>
            <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4" />Delete</button>
          </div>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Client card */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-200 flex-shrink-0">
                {enquiry.clientName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{enquiry.clientName}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  {mobiles.map((m: string, i: number) => (
                    <a key={i} href={`tel:${m}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-violet-600 transition-colors">
                      <Phone className="w-3.5 h-3.5" />{m}
                    </a>
                  ))}
                  {enquiry.email && (
                    <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-violet-600">
                      <Mail className="w-3.5 h-3.5" />{enquiry.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${enquiry.forType === 1 ? "badge-blue" : "badge-orange"}`}>
                  {enquiry.forType === 1 ? "Rent" : "Buy"}
                </span>
                {enquiry.status && <span className="badge badge-green">{enquiry.status.name}</span>}
              </div>
            </div>
          </div>

          {/* Requirements grid */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4">Requirements</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Tag, label: "Type", value: enquiry.propertyType?.name },
                { icon: Tag, label: "Segment", value: enquiry.segment?.name },
                { icon: Tag, label: "BHK/Office", value: enquiry.bhkOffice?.name },
                { icon: DollarSign, label: "Budget", value: enquiry.budget },
                { icon: MapPin, label: "Area", value: enquiry.area?.name },
                { icon: User, label: "Source", value: enquiry.source?.name },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
                </div>
              ))}
            </div>
            {enquiry.remark && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Remark</p>
                <p className="text-sm text-slate-700">{enquiry.remark}</p>
              </div>
            )}
          </div>

          {/* Add follow-up */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-500" /> Add Follow-up
            </h3>
            <form onSubmit={handleSubmit(postComment)} className="space-y-4">
              <div className="form-grid">
                <div>
                  <label className="label">Activity</label>
                  <select {...register("activityId", { valueAsNumber: true })} className="select">
                    <option value="">-- Select activity --</option>
                    {activities.filter((a) => !a.isParent).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Next Follow-up Date</label>
                  <input {...register("nfd")} type="date" className="input" />
                </div>
              </div>
              <div>
                <label className="label">Remark *</label>
                <textarea {...register("remark", { required: true })} rows={3} className="textarea" placeholder="What happened in this follow-up..." />
              </div>
              <button type="submit" disabled={posting} className="btn-primary">
                {posting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Send className="w-4 h-4" />Add Follow-up</>}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-500" /> Follow-up History
              <span className="ml-auto badge badge-violet">{enquiry.comments?.length || 0}</span>
            </h3>
            {enquiry.comments?.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No follow-ups yet</p>
            )}
            <div className="space-y-3">
              {enquiry.comments?.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                    {c.user?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">
                        {c.user?.firstName} {c.user?.lastName}
                        {c.activity && <span className="ml-2 badge badge-violet text-[10px]">{c.activity.name}</span>}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600">{c.remark}</p>
                    {c.nfd && (
                      <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Next: {formatDate(c.nfd)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar info */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Enquiry Info</h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="Enquiry ID" value={`#${enquiry.id}`} />
              <InfoRow label="Added On" value={formatDate(enquiry.addedAt)} />
              <InfoRow label="Added By" value={`${enquiry.user?.firstName} ${enquiry.user?.lastName}`} />
              <InfoRow label="NFD" value={formatDate(enquiry.nfd)} highlight={enquiry.nfd && new Date(enquiry.nfd) < new Date()} />
            </div>
          </div>

          {(enquiry.isDraft || enquiry.isNonUse) && (
            <div className="card p-5 border-orange-100 bg-orange-50">
              <h3 className="font-bold text-orange-700 mb-2 text-sm">Flags</h3>
              {enquiry.isDraft && (
                <p className="badge badge-orange mb-1.5">Draft{enquiry.draftReason && `: ${enquiry.draftReason.name}`}</p>
              )}
              {enquiry.isNonUse && (
                <p className="badge badge-red">Non-Use{enquiry.nonUse && `: ${enquiry.nonUse.name}`}</p>
              )}
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              {mobiles[0] && (
                <a href={`https://api.whatsapp.com/send?phone=91${mobiles[0]}`} target="_blank"
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              {mobiles[0] && (
                <a href={`tel:${mobiles[0]}`}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all">
                  <Phone className="w-4 h-4" /> Call Client
                </a>
              )}
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
      <span className={`font-semibold text-right ${highlight ? "text-red-500" : "text-slate-800"}`}>{value || "—"}</span>
    </div>
  );
}
