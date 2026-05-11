import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Check, X, User, Target, ClipboardList, ArrowLeft } from 'lucide-react';
import {
  fetchMenteeFormDetailThunk, reviewFormThunk, finalReviewThunk,
  selectSelectedMenteeForm, selectMboFormLoading, selectMboSubmitting,
} from '../../store/slices/mboSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LevelBadge from '../../components/shared/LevelBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/ui/Button';
import { MBO_STATUSES } from '../../constants/mboStatuses';
import { needsMentorPhase1Review, needsMentorPhase2Review } from '../../hooks/useMboForm';

const mentorReviewSchema = z.object({ comment: z.string().min(10, 'A comment of at least 10 characters is required.') });

const MenteeReviewPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const form = useSelector(selectSelectedMenteeForm);
  const isLoadingForm = useSelector(selectMboFormLoading);
  const isSubmitting = useSelector(selectMboSubmitting);

  // Phase 1 review form
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: zodResolver(mentorReviewSchema) });
  const commentValue = watch('comment');

  // Phase 2 review local state
  const [p2Objectives, setP2Objectives] = useState([]);
  const [overallComment, setOverallComment] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => { dispatch(fetchMenteeFormDetailThunk(formId)); }, [dispatch, formId]);

  // Sync P2 objectives when form loads
  useEffect(() => {
    if (form?.objectives) {
      setP2Objectives(form.objectives.map((obj, idx) => ({
        objectiveId: String(idx),
        managerComment: obj.managerComment || '',
        achievedPercent: obj.achievedPercent ?? '',
      })));
    }
  }, [form]);

  const isP1Review = form && needsMentorPhase1Review(form.status);
  const isP2Review = form && needsMentorPhase2Review(form.status);
  const isReviewable = isP1Review || isP2Review;

  // ── Phase 1 review handler ──────────────────────────────────────────────────
  const handleP1Action = async (decision) => {
    if (!commentValue || commentValue.length < 10) { toast.error('Please provide a detailed comment.'); return; }
    const confirmMsg = decision === 'approve' ? 'Phase 1 will be approved and the employee can proceed to fill accomplishments. Proceed?' : 'The employee will be notified and can resubmit. Proceed?';
    if (window.confirm(confirmMsg)) {
      const result = await dispatch(reviewFormThunk({ id: formId, decision, comment: commentValue }));
      if (!result.error) { toast.success(`Form ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`); navigate('/mentees'); }
      else toast.error(result.payload || 'Failed to submit review');
    }
  };

  // ── Phase 2 review handlers ─────────────────────────────────────────────────
  const updateP2Obj = (idx, field, value) => {
    setP2Objectives(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o));
  };

  const handleP2Action = async (decision) => {
    if (!overallComment || overallComment.length < 10) { toast.error('Overall comment must be at least 10 characters.'); return; }
    // Validate per-objective
    const incomplete = p2Objectives.some(o => !o.managerComment || o.achievedPercent === '');
    if (incomplete && decision === 'final_approved') { toast.error('Please fill Manager Comment and Achieved % for all objectives.'); return; }

    if (decision === 'final_approved') { setShowApproveModal(true); return; }

    const result = await dispatch(finalReviewThunk({
      id: formId,
      objectives: p2Objectives.map(o => ({ ...o, achievedPercent: Number(o.achievedPercent) })),
      overallComment, decision,
    }));
    if (!result.error) { toast.success('Accomplishments rejected — employee notified.'); navigate('/mentees'); }
    else toast.error(result.payload || 'Failed to submit review');
  };

  const confirmFinalApprove = async () => {
    setShowApproveModal(false);
    const result = await dispatch(finalReviewThunk({
      id: formId,
      objectives: p2Objectives.map(o => ({ ...o, achievedPercent: Number(o.achievedPercent) })),
      overallComment, decision: 'final_approved',
    }));
    if (!result.error) { toast.success('MBO form approved and locked. Complete!'); navigate('/mentees'); }
    else toast.error(result.payload || 'Failed to approve');
  };

  if (isLoadingForm) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div><span className="ml-3 text-gray-500">Loading form...</span></div>);
  }
  if (!form) {
    return (<div className="text-center py-12"><p className="text-gray-600">Form not found.</p><Button variant="secondary" className="mt-4" onClick={() => navigate('/mentees')}>Back to Mentees</Button></div>);
  }

  const employee = form.employeeId;
  const quarter = form.quarterId;
  const isResubmitted = form.submissionCount > 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('/mentees')} className="text-gray-400 hover:text-gray-600 p-1"><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="text-2xl font-bold text-gray-900">{isP2Review ? 'Final Sheet Review' : 'Mentee Form Review'}</h1>
          </div>
          <div className="flex items-center gap-3 mt-2 ml-8">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><User className="h-4 w-4" /> {employee?.name || 'Employee'}</span>
            {employee?.level && <><span className="text-gray-300">|</span><LevelBadge level={employee.level} /></>}
            {employee?.department && <><span className="text-gray-300">|</span><span className="text-sm text-gray-500">{employee.department}</span></>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isResubmitted && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Resubmitted ({form.submissionCount}x)</span>}
          <StatusBadge status={form.status} />
        </div>
      </div>

      {/* P2 Review Banner */}
      {isP2Review && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
          <span className="text-xl">📋</span>
          <div>
            <h3 className="text-sm font-semibold text-orange-800">Final Sheet Submitted — Review Accomplishments</h3>
            <p className="text-sm text-orange-700 mt-1">{employee?.name} has submitted their accomplishments for final scoring.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Read-Only Form ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase 1 Table */}
          <Card>
            <CardHeader className="bg-gray-50 border-b"><CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Phase 1 — Objectives ({quarter?.label})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Objective</th><th className="px-4 py-3 text-left">Key Results</th><th className="px-4 py-3 text-left">Progress</th><th className="px-4 py-3 text-left">Score</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.objectives?.map((obj, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{obj.title}</td>
                        <td className="px-4 py-3"><ul className="list-disc pl-4 text-gray-700 space-y-1">{(obj.keyResults || []).map((kr, i) => <li key={i}>{typeof kr === 'string' ? kr : kr.value}</li>)}</ul></td>
                        <td className="px-4 py-3 text-gray-600">{obj.progress}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600">{obj.selfScore}/5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Phase 2 Table (shown for P2 review) */}
          {isP2Review && (
            <Card>
              <CardHeader className="bg-emerald-50/50 border-b"><CardTitle className="text-emerald-900 text-sm uppercase tracking-wider">Phase 2 — Accomplishments & Scoring</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Objective</th><th className="px-4 py-3 text-left">Accomplishment</th><th className="px-4 py-3 text-left">Manager's Comment ✏️</th><th className="px-4 py-3 text-left w-24">Achieved % ✏️</th><th className="px-4 py-3 text-left w-28">Accomplished ✏️</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {form.objectives?.map((obj, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 text-xs">{obj.title}</td>
                          <td className="px-4 py-3 text-gray-700">{obj.accomplishment || '—'}</td>
                          <td className="px-4 py-3"><textarea className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm" rows={2} value={p2Objectives[idx]?.managerComment || ''} onChange={(e) => updateP2Obj(idx, 'managerComment', e.target.value)} placeholder="Your comment..." /></td>
                          <td className="px-4 py-3"><input type="number" min={0} max={100} className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm" value={p2Objectives[idx]?.achievedPercent ?? ''} onChange={(e) => updateP2Obj(idx, 'achievedPercent', e.target.value)} /></td>
                          <td className="px-4 py-3">
                            {obj.accomplished != null ? (obj.accomplished ? <span className="text-green-600 font-semibold">✅ Yes</span> : <span className="text-red-500 font-semibold">❌ No</span>) : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous review */}
          {form.mentorReview?.comment && (
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50 border-b border-orange-100"><CardTitle className="text-sm text-orange-800">Previous Review Comment</CardTitle></CardHeader>
              <CardContent className="p-4"><p className="text-sm text-orange-900 italic">"{form.mentorReview.comment}"</p>{form.mentorReview.reviewedAt && <p className="text-xs text-orange-600 mt-2">Reviewed on {new Date(form.mentorReview.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}</CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Review Panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-indigo-200 shadow-md">
            <CardHeader className="bg-indigo-600 text-white rounded-t-xl"><CardTitle className="flex items-center gap-2 text-white"><ClipboardList className="h-5 w-5" /> {isP2Review ? 'Final Review' : 'Mentor Review Panel'}</CardTitle></CardHeader>
            <CardContent className="p-6">
              {!isReviewable ? (
                <div className="text-center py-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3"><Check className="h-6 w-6 text-gray-400" /></div>
                  <h3 className="text-sm font-medium text-gray-900">Review Completed</h3>
                  <p className="text-xs text-gray-500 mt-1">This form has already been <strong>{form.status}</strong>.</p>
                </div>
              ) : isP1Review ? (
                /* Phase 1 Review Panel */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Review Comment <span className="text-red-500">*</span></label>
                    <textarea className={`w-full rounded-md border p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.comment ? 'border-red-500' : 'border-gray-300'}`} rows={5} placeholder="Provide constructive feedback..." {...register('comment')} />
                    {errors.comment && <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" className="w-full flex justify-center gap-1.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={() => handleP1Action('reject')} isLoading={isSubmitting}><X className="h-4 w-4" /> Reject</Button>
                    <Button type="button" className="w-full flex justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleP1Action('approve')} isLoading={isSubmitting}><Check className="h-4 w-4" /> Approve</Button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">Actions cannot be undone</p>
                </div>
              ) : (
                /* Phase 2 Final Review Panel */
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Fill Manager's Comments, Achieved %, and Accomplished for each objective in the table to the left.</p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Overall Feedback Comment <span className="text-red-500">*</span></label>
                    <textarea className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500" rows={4} placeholder="Overall comments for this employee's quarter..." value={overallComment} onChange={(e) => setOverallComment(e.target.value)} />
                    {overallComment.length > 0 && overallComment.length < 10 && <p className="text-xs text-red-500 mt-1">At least 10 characters required</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" className="w-full flex justify-center gap-1.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={() => handleP2Action('final_rejected')} isLoading={isSubmitting}><X className="h-4 w-4" /> Reject</Button>
                    <Button type="button" className="w-full flex justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleP2Action('final_approved')} isLoading={isSubmitting}><Check className="h-4 w-4" /> Approve Final</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b"><h3 className="text-lg font-bold text-gray-900">Approve Final MBO?</h3></div>
            <div className="p-6"><p className="text-sm text-gray-700">Once approved, the MBO form is <strong>complete and permanently locked</strong> for all users. Proceed?</p></div>
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <Button variant="ghost" onClick={() => setShowApproveModal(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={confirmFinalApprove} isLoading={isSubmitting}>Approve & Lock</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenteeReviewPage;
