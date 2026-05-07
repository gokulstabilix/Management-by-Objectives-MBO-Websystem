import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Info, CheckCircle2, AlertCircle, Save, Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMyFormsThunk, createDraftThunk, updateDraftThunk,
  submitFormThunk, resubmitFormThunk,
  selectMyForms, selectMboSubmitting, selectMboError, clearMboError,
} from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';

// ── Zod Schema ────────────────────────────────────────────────────────────────
const mboFormSchema = z.object({
  objectives: z.array(z.object({
    title: z.string().min(3, 'Title is required (min 3 chars)'),
    keyResults: z.array(z.object({
      value: z.string().min(3, 'Key result required')
    })).min(1, 'At least one key result required'),
    progress: z.string().min(1, 'Progress is required'),
    selfScore: z.string().min(1, 'Score is required'),
    notes: z.string().optional()
  })).min(1, 'At least one objective is required')
});

// Map DB objectives to form shape
const mapObjectivesToForm = (objectives = []) =>
  objectives.map(obj => ({
    title: obj.title || '',
    keyResults: (obj.keyResults || []).map(kr => ({ value: typeof kr === 'string' ? kr : kr.value || '' })),
    progress: obj.progress || '',
    selfScore: String(obj.selfScore || ''),
    notes: obj.notes || '',
  }));

// Map form shape back to API shape
const mapFormToApi = (objectives = []) =>
  objectives.map(obj => ({
    title: obj.title,
    keyResults: obj.keyResults.map(kr => kr.value),
    progress: obj.progress,
    selfScore: Number(obj.selfScore),
    notes: obj.notes || '',
  }));

const MboFormPage = () => {
  const { id } = useParams(); // 'new' or a form _id
  const isNew = id === 'new';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const myForms = useSelector(selectMyForms);
  const activeQuarter = useSelector(selectActiveQuarter);
  const isSubmitting = useSelector(selectMboSubmitting);
  const apiError = useSelector(selectMboError);

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [form, setForm] = useState(null); // The current MBO form from state

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        dispatch(fetchMyFormsThunk()),
        dispatch(fetchQuartersThunk()),
      ]);
      setIsPageLoading(false);
    };
    init();
  }, [dispatch]);

  // Once myForms loads, find the current form
  useEffect(() => {
    if (!isNew && myForms.length > 0) {
      const found = myForms.find(f => f._id === id);
      setForm(found || null);
    }
  }, [id, isNew, myForms]);

  const formStatus = form?.status || (isNew ? 'draft' : null);
  const mentorComment = form?.mentorReview?.comment;
  const isLocked = ['submitted', 'approved', 'frozen'].includes(formStatus);

  const displayStatus = formStatus
    ? { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', frozen: 'Frozen' }[formStatus] || formStatus
    : 'New';

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(mboFormSchema),
    defaultValues: {
      objectives: [{ title: '', keyResults: [{ value: '' }], progress: '', selfScore: '', notes: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'objectives' });

  // Populate form when editing
  useEffect(() => {
    if (form && form.objectives?.length > 0) {
      reset({ objectives: mapObjectivesToForm(form.objectives) });
    }
  }, [form, reset]);

  // Clear errors on unmount
  useEffect(() => {
    return () => { dispatch(clearMboError()); };
  }, [dispatch]);

  const handleSaveDraft = async (data) => {
    const objectives = mapFormToApi(data.objectives);
    let result;
    if (isNew) {
      if (!activeQuarter) {
        toast.error('No active quarter found. An admin must open a quarter first.');
        return;
      }
      result = await dispatch(createDraftThunk({ quarterId: activeQuarter._id, objectives }));
    } else {
      result = await dispatch(updateDraftThunk({ id, objectives }));
    }

    if (!result.error) {
      toast.success('Draft saved successfully!');
      if (isNew && result.payload?._id) {
        navigate(`/mbo/${result.payload._id}`, { replace: true });
      }
    } else {
      toast.error(result.payload || 'Failed to save draft');
    }
  };

  const handleSubmitForm = async (data) => {
    const objectives = mapFormToApi(data.objectives);
    let result;

    // First save objectives, then submit
    if (isNew) {
      if (!activeQuarter) {
        toast.error('No active quarter. Cannot submit.');
        return;
      }
      const createResult = await dispatch(createDraftThunk({ quarterId: activeQuarter._id, objectives }));
      if (createResult.error) {
        toast.error(createResult.payload || 'Failed to save before submitting');
        return;
      }
      result = await dispatch(submitFormThunk(createResult.payload._id));
    } else if (formStatus === 'rejected') {
      // First update, then resubmit
      await dispatch(updateDraftThunk({ id, objectives }));
      result = await dispatch(resubmitFormThunk(id));
    } else {
      await dispatch(updateDraftThunk({ id, objectives }));
      result = await dispatch(submitFormThunk(id));
    }

    if (!result.error) {
      toast.success(formStatus === 'rejected' ? 'Form resubmitted for review!' : 'Form submitted for mentor review!');
      navigate('/mbo');
    } else {
      toast.error(result.payload || 'Failed to submit form');
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading form...</span>
      </div>
    );
  }

  if (!isNew && !form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-medium">Form not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/mbo')}>Back to My Forms</Button>
      </div>
    );
  }

  const quarterLabel = form?.quarterId?.label || activeQuarter?.label || 'Current Quarter';
  const openedAt = form?.quarterId?.openedAt || activeQuarter?.openedAt;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mbo')} className="text-gray-400 hover:text-gray-600 p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'New MBO Form' : 'MBO Form Builder'}
            </h1>
            <p className="text-sm text-gray-500">Quarterly Management by Objectives</p>
          </div>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {/* Status Banners */}
      {formStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Resubmission Required</h3>
            {mentorComment && (
              <p className="text-sm text-red-700 mt-1 italic">"{mentorComment}"</p>
            )}
          </div>
        </div>
      )}

      {formStatus === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">Form Approved & Locked</h3>
            <p className="text-sm text-green-700 mt-1">This form has been permanently locked by your mentor.</p>
          </div>
        </div>
      )}

      {formStatus === 'submitted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">This form is <strong>under review</strong>. You cannot edit it until your mentor takes action.</p>
        </div>
      )}

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{apiError}</div>
      )}

      {/* Quarter Info */}
      <Card>
        <CardHeader className="bg-gray-50 border-b pb-4">
          <CardTitle className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Info className="h-4 w-4" /> Section 1 — Quarter Info
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

      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
        {/* Objectives Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-bold text-gray-900">Objectives</h2>
            {!isLocked && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ title: '', keyResults: [{ value: '' }], progress: '', selfScore: '', notes: '' })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Objective
              </Button>
            )}
          </div>

          {fields.map((field, index) => (
            <ObjectiveCard
              key={field.id}
              index={index}
              control={control}
              register={register}
              remove={remove}
              errors={errors}
              isLocked={isLocked}
              totalFields={fields.length}
            />
          ))}
          {errors.objectives?.message && (
            <p className="text-red-500 text-sm font-medium">{errors.objectives.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        {!isLocked && (
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={handleSubmit(handleSaveDraft)}
              isLoading={isSubmitting}
            >
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button type="submit" className="gap-2" isLoading={isSubmitting}>
              <Send className="h-4 w-4" />
              {formStatus === 'rejected' ? 'Resubmit Form' : 'Submit Form'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

// ── Objective Card Sub-component ──────────────────────────────────────────────

const ObjectiveCard = ({ index, control, register, remove, errors, isLocked, totalFields }) => {
  const { fields: krFields, append: appendKr, remove: removeKr } = useFieldArray({
    control,
    name: `objectives.${index}.keyResults`
  });

  const objError = errors?.objectives?.[index];

  return (
    <Card className="border-indigo-100 shadow-sm relative">
      <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 flex flex-row justify-between items-center py-4">
        <CardTitle className="text-indigo-900">Objective {index + 1}</CardTitle>
        {!isLocked && totalFields > 1 && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 p-1 bg-white rounded-md shadow-sm border border-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Input
          label="Objective Title"
          placeholder="e.g. Launch new enterprise feature set"
          {...register(`objectives.${index}.title`)}
          error={objError?.title?.message}
          disabled={isLocked}
        />

        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Key Results</label>
            {!isLocked && (
              <button
                type="button"
                onClick={() => appendKr({ value: '' })}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add KR
              </button>
            )}
          </div>

          {krFields.map((kr, krIndex) => (
            <div key={kr.id} className="flex gap-2">
              <div className="flex-1">
                <input
                  className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    objError?.keyResults?.[krIndex]?.value
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder={`Key Result ${krIndex + 1}`}
                  {...register(`objectives.${index}.keyResults.${krIndex}.value`)}
                  disabled={isLocked}
                />
                {objError?.keyResults?.[krIndex]?.value && (
                  <p className="mt-1 text-xs text-red-500">{objError.keyResults[krIndex].value.message}</p>
                )}
              </div>
              {!isLocked && krFields.length > 1 && (
                <button type="button" onClick={() => removeKr(krIndex)} className="text-gray-400 hover:text-red-500 px-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Progress (%) or Text"
            placeholder="e.g. 75% completed"
            {...register(`objectives.${index}.progress`)}
            error={objError?.progress?.message}
            disabled={isLocked}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Self-Assessment Score</label>
            <select
              className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                objError?.selfScore
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              {...register(`objectives.${index}.selfScore`)}
              disabled={isLocked}
            >
              <option value="">Select a score (1-5)</option>
              <option value="1">1 - Needs Improvement</option>
              <option value="2">2 - Below Expectations</option>
              <option value="3">3 - Meets Expectations</option>
              <option value="4">4 - Exceeds Expectations</option>
              <option value="5">5 - Outstanding</option>
            </select>
            {objError?.selfScore && (
              <p className="mt-1 text-sm text-red-500">{objError.selfScore.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={3}
            placeholder="Any additional context..."
            {...register(`objectives.${index}.notes`)}
            disabled={isLocked}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MboFormPage;
