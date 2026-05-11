import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Info, Save, Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMyFormsThunk, fetchFormByIdThunk, createDraftThunk, updateDraftThunk,
  submitFormThunk, resubmitFormThunk, saveAccomplishmentsThunk, submitAccomplishmentsThunk,
  selectMyForms, selectMboSubmitting, selectMboError, selectMboFormLoading, clearMboError,
} from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import SubmitFinalModal from './components/SubmitFinalModal';
import MboStatusBanners from './components/MboStatusBanners';
import MboPhase1Table from './components/MboPhase1Table';
import MboPhase2Table from './components/MboPhase2Table';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { isPhase1Editable, isPhase2Unlocked, isPhase2Editable, isFinallyLocked, getCurrentPhase } from '../../utils/mboFormHelpers';

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
    const payload = accomplishments.map(a => ({ 
      ...a, 
      accomplishment: a.accomplishment || '',
      accomplished: a.accomplished ?? false 
    }));
    const result = await dispatch(saveAccomplishmentsThunk({ id, accomplishments: payload }));
    if (!result.error) toast.success('Phase 2 started!');
    else toast.error(result.payload || 'Failed to start Phase 2');
  };

  if (isPageLoading || isFormLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading form...</span>
      </div>
    );
  }
  
  if (!isNew && !form && formFetchAttempted) {
    return (
      <div className="text-center py-12">
        <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{apiError || 'Form not found.'}</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/mbo')}>Back to My Forms</Button>
      </div>
    );
  }

  const quarterLabel = form?.quarterId?.label || activeQuarter?.label || 'Current Quarter';
  const openedAt = form?.quarterId?.openedAt || activeQuarter?.openedAt;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mbo')} className="text-gray-400 hover:text-gray-600 p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'New MBO Form' : 'MBO Form'}</h1>
            <p className="text-sm text-gray-500">Phase {phase} — {phase === 1 ? 'Objective Setting' : 'Accomplishments'}</p>
          </div>
        </div>
        <StatusBadge status={formStatus} />
      </div>

      <MboStatusBanners 
        formStatus={formStatus}
        mentorComment={mentorComment}
        mentorName={mentorName}
        reviewedAt={form?.mentorReview?.reviewedAt}
        finalComment={form?.finalReview?.comment}
        fullyLocked={fullyLocked}
        apiError={apiError}
        onStartAccomplishments={handleStartAccomplishments}
      />

      <Card>
        <CardHeader className="bg-gray-50 border-b pb-4">
          <CardTitle className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Info className="h-4 w-4" /> Quarter Info
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Quarter</label>
              <div className="text-gray-900 font-medium">{quarterLabel}</div>
            </div>
            {openedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Opened</label>
                <div className="text-gray-900 font-medium">
                  {new Date(openedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <MboPhase1Table 
        fields={fields}
        register={register}
        remove={remove}
        append={append}
        errors={errors}
        p1Editable={p1Editable}
        formStatus={formStatus}
      />

      {p1Editable && (
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={handleSubmit(handleSaveDraft)} isLoading={isSubmitting}>
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button type="button" className="gap-2" onClick={handleSubmit(handleSubmitP1)} isLoading={isSubmitting}>
            <Send className="h-4 w-4" /> {formStatus === 'rejected' ? 'Resubmit' : 'Submit for Approval'}
          </Button>
        </div>
      )}

      {p2Unlocked && (
        <MboPhase2Table 
          objectives={form?.objectives}
          accomplishments={accomplishments}
          p2Editable={p2Editable}
          fullyLocked={fullyLocked}
          onAccomplishmentChange={handleAccomplishmentChange}
        />
      )}

      {p2Editable && (
        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={handleSaveAccomplishments} isLoading={isSubmitting}>
            <Save className="h-4 w-4" /> Save Progress
          </Button>
          <Button type="button" className="gap-2" onClick={() => setShowFinalModal(true)} isLoading={isSubmitting}>
            <Send className="h-4 w-4" /> Submit Final Sheet
          </Button>
        </div>
      )}

      {showFinalModal && (
        <SubmitFinalModal 
          mentorName={mentorName} 
          onClose={() => setShowFinalModal(false)} 
          onConfirm={handleSubmitFinal} 
          isLoading={isSubmitting} 
        />
      )}
    </div>
  );
};

export default MboFormPage;
