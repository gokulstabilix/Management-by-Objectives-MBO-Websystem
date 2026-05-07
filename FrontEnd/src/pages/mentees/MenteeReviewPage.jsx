import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Check, X, User, Target, ClipboardList, ArrowLeft } from 'lucide-react';
import {
  fetchMenteeFormDetailThunk, reviewFormThunk,
  selectSelectedMenteeForm, selectMboFormLoading, selectMboSubmitting,
} from '../../store/slices/mboSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LevelBadge from '../../components/shared/LevelBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/ui/Button';

// ── Schema ────────────────────────────────────────────────────────────────────
const mentorReviewSchema = z.object({
  comment: z.string().min(10, 'A comment of at least 10 characters is required.'),
});

const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const MenteeReviewPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useSelector(selectSelectedMenteeForm);
  const isLoadingForm = useSelector(selectMboFormLoading);
  const isSubmitting = useSelector(selectMboSubmitting);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(mentorReviewSchema),
  });

  const commentValue = watch('comment');

  useEffect(() => {
    dispatch(fetchMenteeFormDetailThunk(formId));
  }, [dispatch, formId]);

  const handleAction = async (decision) => {
    if (!commentValue || commentValue.length < 10) {
      toast.error('Please provide a detailed comment before deciding.');
      return;
    }

    const confirmMsg = decision === 'approve'
      ? 'Once approved, this form is permanently locked. Proceed?'
      : 'The employee will be notified and can resubmit. Proceed?';

    if (window.confirm(confirmMsg)) {
      const result = await dispatch(reviewFormThunk({ id: formId, decision, comment: commentValue }));
      if (!result.error) {
        toast.success(`Form ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`);
        navigate('/mentees');
      } else {
        toast.error(result.payload || 'Failed to submit review');
      }
    }
  };

  if (isLoadingForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading form...</span>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Form not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/mentees')}>Back to Mentees</Button>
      </div>
    );
  }

  const employee = form.employeeId;
  const quarter = form.quarterId;
  const displayStatus = fmt(form.status);
  const isResubmitted = form.submissionCount > 1;
  const isReviewable = form.status === 'submitted';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('/mentees')} className="text-gray-400 hover:text-gray-600 p-1">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Mentee Form Review</h1>
          </div>
          <div className="flex items-center gap-3 mt-2 ml-8">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <User className="h-4 w-4" /> {employee?.name || 'Employee'}
            </span>
            {employee?.level && (
              <>
                <span className="text-gray-300">|</span>
                <LevelBadge level={employee.level} />
              </>
            )}
            {employee?.department && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{employee.department}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isResubmitted && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
              Resubmitted ({form.submissionCount}x)
            </span>
          )}
          <StatusBadge status={displayStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Read-Only Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">
                Quarter {quarter?.label} — Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {form.objectives?.length === 0 ? (
                <p className="text-gray-500 text-sm">No objectives submitted.</p>
              ) : (
                form.objectives?.map((obj, idx) => (
                  <div key={idx} className="relative">
                    {idx !== 0 && <hr className="absolute -top-4 left-0 right-0 border-gray-100" />}
                    <h3 className="text-lg font-bold text-gray-900 flex items-start gap-2 mb-4">
                      <Target className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      {idx + 1}. {obj.title}
                    </h3>

                    <div className="ml-7 space-y-4">
                      <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Results</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                          {(obj.keyResults || []).map((kr, i) => (
                            <li key={i}>{typeof kr === 'string' ? kr : kr.value}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-100 rounded-md p-3 shadow-sm">
                          <span className="block text-xs font-semibold text-gray-500 uppercase">Progress</span>
                          <span className="text-sm font-medium text-gray-900">{obj.progress}</span>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-md p-3 shadow-sm">
                          <span className="block text-xs font-semibold text-gray-500 uppercase">Self-Score</span>
                          <span className="text-sm font-bold text-indigo-600">{obj.selfScore} / 5</span>
                        </div>
                      </div>

                      {obj.notes && (
                        <div>
                          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</span>
                          <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-100">
                            "{obj.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Previous Mentor Review (if any) */}
          {form.mentorReview?.comment && (
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50 border-b border-orange-100">
                <CardTitle className="text-sm text-orange-800">Previous Review Comment</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-orange-900 italic">"{form.mentorReview.comment}"</p>
                {form.mentorReview.reviewedAt && (
                  <p className="text-xs text-orange-600 mt-2">
                    Reviewed on {new Date(form.mentorReview.reviewedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Mentor Review Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-indigo-200 shadow-md">
            <CardHeader className="bg-indigo-600 text-white rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <ClipboardList className="h-5 w-5" />
                Mentor Review Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!isReviewable ? (
                <div className="text-center py-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Check className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">Review Completed</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    This form has already been <strong>{displayStatus.toLowerCase()}</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Review Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`w-full rounded-md border p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.comment ? 'border-red-500' : 'border-gray-300'}`}
                      rows={5}
                      placeholder="Provide constructive feedback. This comment is required and will be visible to the mentee."
                      {...register('comment')}
                    />
                    {errors.comment && (
                      <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full flex justify-center gap-1.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                      onClick={() => handleAction('reject')}
                      isLoading={isSubmitting}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                    <Button
                      type="button"
                      className="w-full flex justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction('approve')}
                      isLoading={isSubmitting}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">
                    Actions cannot be undone
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MenteeReviewPage;
