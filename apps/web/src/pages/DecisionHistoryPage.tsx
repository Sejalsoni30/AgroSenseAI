import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Send,
  Calendar,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { SourceBadge } from '../components/SourceBadge';

export const DecisionHistoryPage: React.FC = () => {
  const { activeFarm, activeZone } = useFarm();
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Feedback form state
  const [agreed, setAgreed] = useState<boolean>(true);
  const [actionTaken, setActionTaken] = useState<'IRRIGATED' | 'DID_NOT_IRRIGATE' | 'OTHER'>('IRRIGATED');
  const [appliedMm, setAppliedMm] = useState<string>('30');
  const [observation, setObservation] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (activeZone) {
      loadHistory(activeZone._id);
    }
  }, [activeZone]);

  const loadHistory = async (zoneId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/decisions/history/zone/${zoneId}`);
      const list = res.data.runs || [];
      setRuns(list);
      if (list.length > 0) setSelectedRun(list[0]);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRun) return;
    setSubmittingFeedback(true);
    setFeedbackSuccess(null);

    try {
      await axios.post('/api/feedback', {
        runId: selectedRun._id,
        agreedWithRecommendation: agreed,
        actualActionTaken: actionTaken,
        waterAppliedMm: actionTaken === 'IRRIGATED' ? parseFloat(appliedMm) : undefined,
        farmerObservation: observation
      });
      setFeedbackSuccess('Observation recorded successfully! Stored for audit and evaluation analysis.');
      setObservation('');
    } catch (err: any) {
      console.error('Feedback submit error:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <History className="w-6 h-6 text-forest-700" />
            <span>Immutable Decision Audit Trail & Feedback</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Module H: Every recommendation is cryptographically recorded with full input snapshots and version provenance.
          </p>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-forest-400" />
          <span>Append-Only Immutable Records</span>
        </div>
      </div>

      {/* Grid: Run List + Detail Snapshot & Feedback Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Decision Runs List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between max-h-[750px] overflow-hidden">
          <div className="overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Decision Execution History ({runs.length})
            </span>

            {runs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {loading ? 'Loading decision snapshots...' : 'No decision runs recorded for this zone yet.'}
              </div>
            ) : (
              runs.map((r) => {
                const isSelected = selectedRun?._id === r._id;
                return (
                  <div
                    key={r._id}
                    onClick={() => {
                      setSelectedRun(r);
                      setFeedbackSuccess(null);
                    }}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      isSelected
                        ? 'bg-forest-50/70 border-forest-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <ConfidenceBadge decision={r.decision} size="sm" />
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
                      <span>Reliability: <strong>{(r.reliabilityScore * 100).toFixed(0)}%</strong></span>
                      <span>Depletion: <strong>{r.waterBalance?.drMm?.toFixed(1) || 0} mm</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Snapshot Detail & Farmer Feedback Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRun ? (
            <>
              {/* Snapshot Inspector */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Snapshot Inspection: {new Date(selectedRun.timestamp).toLocaleString()}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      Run ID: {selectedRun._id} • Version: {selectedRun.engineVersion}
                    </span>
                  </div>
                  <ConfidenceBadge decision={selectedRun.decision} size="sm" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Reliability Score:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {(selectedRun.reliabilityScore * 100).toFixed(0)}% ({selectedRun.reliabilityStatus})
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Net Depletion (Dr):</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedRun.waterBalance?.drMm} mm
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Crop Water ETc:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedRun.waterBalance?.etcMm} mm/day
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Rain Offset:</span>
                    <span className="font-bold text-sky-700 text-sm">
                      {selectedRun.waterBalance?.pEffMm} mm
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3.5 bg-forest-50/70 border border-forest-200 rounded-xl text-xs text-forest-950 font-medium">
                  {selectedRun.explanation?.summary?.en || 'Autonomous evaluation completed.'}
                </div>
              </div>

              {/* Farmer Feedback Submission Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-forest-700" />
                    <h3 className="font-bold text-base text-slate-900">
                      Submit Grower Field Observation & Feedback
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    Zero Auto-Retraining (Rule #6)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Your feedback is preserved for scientific accuracy comparison and post-hoc agronomist audits. Per our non-negotiable integrity rules, user feedback is never automatically piped into model weight retraining.
                </p>

                {feedbackSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feedbackSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Did you agree with this recommendation?
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setAgreed(true)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                            agreed
                              ? 'bg-forest-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Agreed</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAgreed(false)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                            !agreed
                              ? 'bg-rose-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Disagreed</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Actual Field Action Executed
                      </label>
                      <select
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      >
                        <option value="IRRIGATED">Irrigated Field</option>
                        <option value="DID_NOT_IRRIGATE">Did Not Irrigate</option>
                        <option value="OTHER">Other / Deferred Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {actionTaken === 'IRRIGATED' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Actual Water Applied (mm or liters equivalent)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={appliedMm}
                        onChange={(e) => setAppliedMm(e.target.value)}
                        placeholder="e.g. 25"
                        className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Field Observations & Soil Texture Notes
                    </label>
                    <textarea
                      rows={3}
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      placeholder="e.g. Topsoil showed slight cracking in south corner, but root zone at 40cm was still damp."
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center space-x-1.5 disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingFeedback ? 'Recording...' : 'Submit Field Observation'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-400 text-xs">
              Select a decision snapshot on the left to inspect parameters and provide feedback.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

