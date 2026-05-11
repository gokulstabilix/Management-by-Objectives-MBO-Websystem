import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Info, CheckCircle2, AlertCircle, Save, Send, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMyFormsThunk, fetchFormByIdThunk, createDraftThunk, updateDraftThunk,
  submitFormThunk, resubmitFormThunk, saveAccomplishmentsThunk, submitAccomplishmentsThunk,
  selectMyForms, selectMboSubmitting, selectMboError, selectMboFormLoading, clearMboError,
} from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { MBO_STATUSES } from '../../constants/mboStatuses';
import { isPhase1Editable, isPhase2Unlocked, isPhase2Editable, isFinallyLocked, getCurrentPhase } from '../../hooks/useMboForm';

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const phase1Schema = z.object({
  objectives: z.array(z.object({
    title: z.string().min(3, 'Title is required (min 3 chars)'),
    keyResults: z.array(z.object({ value: z.string().min(3, 'Key result required') })).min(1, 'At least one key result required'),
    progress: z.string().min(1, 'Progress is required'),
    selfScore: z.string().min(1, 'Score is required'),
    notes: z.string().optional()
  })).min(1, 'At least one objective is required')
});

// Map DB objectives to form shape
const mapObjectivesToForm = (objectives = []) =>
  objectives.map(obj => ({
    title: obj.title || '', keyResults: (obj.keyResults || []).map(kr => ({ value: typeof kr === 'string' ? kr : kr.value || '' })),
    progress: obj.progress || '', selfScore: String(obj.selfScore || ''), notes: obj.notes || '',
  }));

const mapFormToApi = (objectives = []) =>
  objectives.map(obj => ({
    title: obj.title, keyResults: obj.keyResults.map(kr => kr.value),
    progress: obj.progress, selfScore: Number(obj.selfScore), notes: obj.notes || '',
  }));

import SubmitFinalModal from './components/SubmitFinalModal';

const MboFormPage = () => {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const myForms = useSelector(selectMyForms);
  const activeQuarter = useSelector(selectActiveQuarter);
  const isSubmitting = useSelector(selectMboSubmitting);
  const isFormLoading = useSelector(selectMboFormLoading);
  const apiError = useSelector(selectMboError);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [formFetchAttempted, setFormFetchAttempted] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  // Phase 2 local state
  const [accomplishments, setAccomplishments] = useState([]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([dispatch(fetchMyFormsThunk()), dispatch(fetchQuartersThunk())]);
      setIsPageLoading(false);
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    if (isNew || isPageLoading) return;
    const found = myForms.find(f => f._id === id);
    if (found) { setForm(found); }
    else if (!formFetchAttempted) {
      setFormFetchAttempted(true);
      dispatch(fetchFormByIdThunk(id)).then((result) => { if (!result.error && result.payload) setForm(result.payload); });
    }
  }, [id, isNew, isPageLoading, myForms, formFetchAttempted, dispatch]);

  // Sync accomplishments from form data
  useEffect(() => {
    if (form?.objectives) {
      setAccomplishments(form.objectives.map((obj, idx) => ({
        objectiveId: String(idx),
        accomplishment: obj.accomplishment || '',
        accomplished: obj.accomplished ?? false,
      })));
    }
  }, [form]);

  const formStatus = form?.status || (isNew ? 'draft' : null);
  const mentorComment = form?.mentorReview?.comment;
  const mentorName = form?.employeeId?.mentorId?.name || form?.mentorReview?.reviewedBy?.name || '';
  const phase = getCurrentPhase(formStatus);
  const p1Editable = isPhase1Editable(formStatus);
  const p2Unlocked = isPhase2Unlocked(formStatus);
  const p2Editable = isPhase2Editable(formStatus);
  const fullyLocked = isFinallyLocked(formStatus);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(phase1Schema),
    defaultValues: { objectives: [{ title: '', keyResults: [{ value: '' }], progress: '', selfScore: '', notes: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'objectives' });

  useEffect(() => {
    if (form?.objectives?.length > 0) reset({ objectives: mapObjectivesToForm(form.objectives) });
  }, [form, reset]);

  useEffect(() => { return () => { dispatch(clearMboError()); }; }, [dispatch]);

  // ── Phase 1 Handlers ────────────────────────────────────────────────────────
  const handleSaveDraft = async (data) => {
    const objectives = mapFormToApi(data.objectives);
    let result;
    if (isNew) {
      if (!activeQuarter) { toast.error('No active quarter found.'); return; }
      result = await dispatch(createDraftThunk({ quarterId: activeQuarter._id, objectives }));
    } else { result = await dispatch(updateDraftThunk({ id, objectives })); }
    if (!result.error) { toast.success('Draft saved!'); if (isNew && result.payload?._id) navigate(`/mbo/${result.payload._id}`, { replace: true }); }
    else toast.error(result.payload || 'Failed to save draft');
  };

  const handleSubmitP1 = async (data) => {
    const objectives = mapFormToApi(data.objectives);
    let result;
    if (isNew) {
      if (!activeQuarter) { toast.error('No active quarter.'); return; }
      const cr = await dispatch(createDraftThunk({ quarterId: activeQuarter._id, objectives }));
      if (cr.error) { toast.error(cr.payload || 'Failed to save'); return; }
      result = await dispatch(submitFormThunk(cr.payload._id));
    } else if (formStatus === 'rejected') {
      await dispatch(updateDraftThunk({ id, objectives }));
      result = await dispatch(resubmitFormThunk(id));
    } else {
      await dispatch(updateDraftThunk({ id, objectives }));
      result = await dispatch(submitFormThunk(id));
    }
    if (!result.error) { toast.success(formStatus === 'rejected' ? 'Resubmitted!' : 'Submitted for review!'); navigate('/mbo'); }
    else toast.error(result.payload || 'Failed to submit');
  };

  // ── Phase 2 Handlers ────────────────────────────────────────────────────────
  const handleAccomplishmentChange = (idx, field, value) => {
    setAccomplishments(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const handleSaveAccomplishments = async () => {
    const result = await dispatch(saveAccomplishmentsThunk({ id, accomplishments }));
    if (!result.error) toast.success('Progress saved!');
    else toast.error(result.payload || 'Failed to save');
  };

  const handleSubmitFinal = async () => {
    const result = await dispatch(submitAccomplishmentsThunk(id));
    setShowFinalModal(false);
    if (!result.error) { toast.success('Final sheet submitted!'); navigate('/mbo'); }
    else toast.error(result.payload || 'Failed to submit');
  };

  const handleStartAccomplishments = async () => {
    // Transition from 'approved' to 'accomplishment_draft'
    const payload = accomplishments.map(a => ({ 
      ...a, 
      accomplishment: a.accomplishment || '',
      accomplished: a.accomplished ?? false 
    }));
    const result = await dispatch(saveAccomplishmentsThunk({ id, accomplishments: payload }));
    if (!result.error) toast.success('Phase 2 started!');
    else toast.error(result.payload || 'Failed to start Phase 2');
  };

  // ── Loading / Error States ──────────────────────────────────────────────────
  if (isPageLoading || isFormLoading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div><span className="ml-3 text-gray-500">Loading form...</span></div>);
  }
  if (!isNew && !form && formFetchAttempted) {
    return (<div className="text-center py-12"><AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 font-medium">{apiError || 'Form not found.'}</p><Button variant="secondary" className="mt-4" onClick={() => navigate('/mbo')}>Back to My Forms</Button></div>);
  }

  const quarterLabel = form?.quarterId?.label || activeQuarter?.label || 'Current Quarter';
  const openedAt = form?.quarterId?.openedAt || activeQuarter?.openedAt;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mbo')} className="text-gray-400 hover:text-gray-600 p-1"><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'New MBO Form' : 'MBO Form'}</h1>
            <p className="text-sm text-gray-500">Phase {phase} — {phase === 1 ? 'Objective Setting' : 'Accomplishments'}</p>
          </div>
        </div>
        <StatusBadge status={formStatus} />
      </div>

      {/* ── Status Banners ───────────────────────────────────────────────────── */}
      {formStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div><h3 className="text-sm font-semibold text-red-800">Resubmission Required</h3>{mentorComment && <p className="text-sm text-red-700 mt-1 italic">"{mentorComment}"</p>}</div>
        </div>
      )}
      {formStatus === 'final_rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div><h3 className="text-sm font-semibold text-red-800">Accomplishments Rejected — Please Revise</h3>{form?.finalReview?.comment && <p className="text-sm text-red-700 mt-1 italic">"{form.finalReview.comment}"</p>}</div>
        </div>
      )}
      {formStatus === 'approved' && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex gap-3 items-center justify-between">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-teal-800">✅ Phase 1 Approved — You can now fill your Accomplishments</h3>
              <p className="text-sm text-teal-700 mt-1">Approved by {form?.mentorReview?.reviewedBy?.name || 'Mentor'} on {form?.mentorReview?.reviewedAt ? new Date(form.mentorReview.reviewedAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <Button size="sm" className="gap-1 flex-shrink-0" onClick={handleStartAccomplishments}><ArrowRight className="h-4 w-4" /> Start Accomplishments</Button>
        </div>
      )}
      {formStatus === 'submitted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3"><Info className="h-5 w-5 text-blue-600 flex-shrink-0" /><p className="text-sm text-blue-800">This form is <strong>under review</strong>. You cannot edit it until your mentor takes action.</p></div>
      )}
      {formStatus === 'accomplishment_submitted' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3"><Info className="h-5 w-5 text-orange-600 flex-shrink-0" /><p className="text-sm text-orange-800">Final sheet submitted — <strong>Awaiting mentor verification</strong></p></div>
      )}
      {fullyLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3"><Lock className="h-5 w-5 text-green-600 flex-shrink-0" /><p className="text-sm text-green-800 font-semibold">✅ MBO Complete — This form is permanently locked.</p></div>
      )}
      {apiError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{apiError}</div>}

      {/* ── Quarter Info ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="bg-gray-50 border-b pb-4"><CardTitle className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2"><Info className="h-4 w-4" /> Quarter Info</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-gray-500 mb-1">Quarter</label><div className="text-gray-900 font-medium">{quarterLabel}</div></div>
            {openedAt && <div><label className="block text-sm font-medium text-gray-500 mb-1">Opened</label><div className="text-gray-900 font-medium">{new Date(openedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>}
          </div>
        </CardContent>
      </Card>

      {/* ── PHASE 1: Objectives Table ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="bg-indigo-50/50 border-b"><CardTitle className="text-indigo-900 flex items-center gap-2">📋 Phase 1 — Objective Setting {!p1Editable && formStatus !== 'draft' && <Lock className="h-4 w-4 text-gray-400" />}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left w-8">#</th>
                  <th className="px-4 py-3 text-left">Objective Title</th>
                  <th className="px-4 py-3 text-left">Key Results</th>
                  <th className="px-4 py-3 text-left w-32">Progress</th>
                  <th className="px-4 py-3 text-left w-24">Set (%)</th>
                  {p1Editable && <th className="px-4 py-3 w-10"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field, index) => {
                  const objErr = errors?.objectives?.[index];
                  return (
                    <tr key={field.id} className="align-top">
                      <td className="px-4 py-3 text-gray-400 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <input className={`w-full border rounded-md px-2 py-1.5 text-sm ${objErr?.title ? 'border-red-400' : 'border-gray-300'} disabled:bg-gray-50 disabled:cursor-not-allowed`} {...register(`objectives.${index}.title`)} disabled={!p1Editable} placeholder="Objective title" />
                        {objErr?.title && <p className="text-xs text-red-500 mt-1">{objErr.title.message}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {(field.keyResults || [{ value: '' }]).map((_, krIdx) => (
                          <input key={krIdx} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm mb-1 disabled:bg-gray-50 disabled:cursor-not-allowed" {...register(`objectives.${index}.keyResults.${krIdx}.value`)} disabled={!p1Editable} placeholder={`KR ${krIdx + 1}`} />
                        ))}
                      </td>
                      <td className="px-4 py-3"><input className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-50" {...register(`objectives.${index}.progress`)} disabled={!p1Editable} placeholder="e.g. 75%" /></td>
                      <td className="px-4 py-3">
                        <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-50" {...register(`objectives.${index}.selfScore`)} disabled={!p1Editable}>
                          <option value="">—</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
                        </select>
                      </td>
                      {p1Editable && (
                        <td className="px-4 py-3">
                          {fields.length > 1 && <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {p1Editable && (
            <div className="p-4 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={() => append({ title: '', keyResults: [{ value: '' }], progress: '', selfScore: '', notes: '' })}><Plus className="h-4 w-4 mr-1" /> Add Objective</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 1 Actions */}
      {p1Editable && (
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={handleSubmit(handleSaveDraft)} isLoading={isSubmitting}><Save className="h-4 w-4" /> Save Draft</Button>
          <Button type="button" className="gap-2" onClick={handleSubmit(handleSubmitP1)} isLoading={isSubmitting}><Send className="h-4 w-4" /> {formStatus === 'rejected' ? 'Resubmit' : 'Submit for Approval'}</Button>
        </div>
      )}

      {/* ── PHASE 2: Accomplishments ─────────────────────────────────────────── */}
      {p2Unlocked && (
        <Card>
          <CardHeader className="bg-emerald-50/50 border-b"><CardTitle className="text-emerald-900 flex items-center gap-2">🏆 Phase 2 — Accomplishments {fullyLocked && <Lock className="h-4 w-4 text-gray-400" />}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Objective</th>
                    <th className="px-4 py-3 text-left">Accomplishments</th>
                    <th className="px-4 py-3 text-left w-40">Manager's Comments</th>
                    <th className="px-4 py-3 text-left w-24">Achieved %</th>
                    <th className="px-4 py-3 text-left w-28">Accomplished</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(form?.objectives || []).map((obj, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{obj.title}</td>
                      <td className="px-4 py-3">
                        {p2Editable ? (
                          <textarea className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" rows={2} value={accomplishments[idx]?.accomplishment || ''} onChange={(e) => handleAccomplishmentChange(idx, 'accomplishment', e.target.value)} placeholder="Describe your accomplishment..." />
                        ) : (
                          <span className="text-gray-700">{obj.accomplishment || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs italic">{obj.managerComment || <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-gray-600">{obj.achievedPercent != null ? `${obj.achievedPercent}%` : '—'}</td>
                      <td className="px-4 py-3">
                        {p2Editable ? (
                          <select className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" value={accomplishments[idx]?.accomplished ? 'yes' : 'no'} onChange={(e) => handleAccomplishmentChange(idx, 'accomplished', e.target.value === 'yes')}>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        ) : (
                          obj.accomplished != null ? (obj.accomplished ? <span className="text-green-600 font-semibold">✅ Yes</span> : <span className="text-red-500 font-semibold">❌ No</span>) : <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 2 Actions */}
      {p2Editable && (
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={handleSaveAccomplishments} isLoading={isSubmitting}><Save className="h-4 w-4" /> Save Progress</Button>
          <Button type="button" className="gap-2" onClick={() => setShowFinalModal(true)} isLoading={isSubmitting}><Send className="h-4 w-4" /> Submit Final Sheet</Button>
        </div>
      )}

      {showFinalModal && <SubmitFinalModal mentorName={mentorName} onClose={() => setShowFinalModal(false)} onConfirm={handleSubmitFinal} isLoading={isSubmitting} />}
    </div>
  );
};

export default MboFormPage;
