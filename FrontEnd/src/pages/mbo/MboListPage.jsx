import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Target, Plus, FileText } from 'lucide-react';
import {
  fetchMyFormsThunk,
  selectMyForms, selectMboLoading, selectMboError,
} from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/ui/Button';
import { MBO_STATUSES } from '../../constants/mboStatuses';

/** Phase-aware CTA message for each status. */
const getCardCta = (status) => {
  switch (status) {
    case MBO_STATUSES.DRAFT: return { text: 'Continue Editing', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
    case MBO_STATUSES.SUBMITTED: return { text: 'Under Review (P1)', bg: 'bg-blue-50 text-blue-700 border-blue-100' };
    case MBO_STATUSES.APPROVED: return { text: 'Phase 1 Approved → Fill Accomplishments', bg: 'bg-teal-50 text-teal-700 border-teal-100' };
    case MBO_STATUSES.REJECTED: return { text: 'Resubmit Required', bg: 'bg-red-50 text-red-700 border-red-100' };
    case MBO_STATUSES.ACCOMPLISHMENT_DRAFT: return { text: 'Continue Accomplishments', bg: 'bg-yellow-50 text-yellow-700 border-yellow-100' };
    case MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED: return { text: 'Phase 2: Pending mentor review', bg: 'bg-orange-50 text-orange-700 border-orange-100' };
    case MBO_STATUSES.FINAL_REJECTED: return { text: 'Revise Accomplishments', bg: 'bg-red-50 text-red-700 border-red-100' };
    case MBO_STATUSES.FINAL_APPROVED:
    case MBO_STATUSES.COMPLETE: return { text: '✅ MBO Complete', bg: 'bg-green-50 text-green-700 border-green-100' };
    case MBO_STATUSES.FROZEN: return { text: 'Frozen', bg: 'bg-purple-50 text-purple-700 border-purple-100' };
    default: return { text: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
};

const MboListPage = () => {
  const dispatch = useDispatch();
  const forms = useSelector(selectMyForms);
  const isLoading = useSelector(selectMboLoading);
  const error = useSelector(selectMboError);
  const activeQuarter = useSelector(selectActiveQuarter);

  useEffect(() => {
    dispatch(fetchMyFormsThunk());
    dispatch(fetchQuartersThunk());
  }, [dispatch]);

  const isQuarterOpen = !!activeQuarter;
  const activeFormExists = forms.some(f =>
    f.quarterId?._id === activeQuarter?._id || f.quarterId === activeQuarter?._id
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading your MBO forms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My MBO Forms</h1>
          <p className="text-sm text-gray-500">Track and manage your Management by Objectives forms.</p>
        </div>
        {isQuarterOpen && !activeFormExists && (
          <Link to={`/mbo/new`}>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Start New MBO</Button>
          </Link>
        )}
      </div>

      {isQuarterOpen && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-5 py-3 flex items-center gap-3 text-sm">
          <Target className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          <div>
            <span className="font-semibold text-indigo-900">Active Quarter: {activeQuarter.label}</span>
            <span className="text-indigo-700 ml-2">— Quarter is open for MBO submissions.</span>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}

      {forms.length === 0 && !isLoading ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No MBO Forms Yet</h3>
          <p className="text-sm text-gray-500 mt-2">
            {isQuarterOpen ? 'An active quarter is open. Start your MBO form now.' : 'No active quarter. An admin or HR will open the next quarter.'}
          </p>
          {isQuarterOpen && (
            <Link to="/mbo/new" className="mt-6 inline-block">
              <Button className="gap-2"><Plus className="h-4 w-4" /> Start New MBO</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => {
            const quarterLabel = form.quarterId?.label || 'Quarter';
            const objCount = form.objectives?.length || 0;
            const submittedDate = form.submittedAt
              ? new Date(form.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Not submitted';
            const cta = getCardCta(form.status);

            return (
              <Card key={form._id} className="flex flex-col hover:border-indigo-300 transition-colors cursor-pointer group">
                <Link to={`/mbo/${form._id}`} className="flex flex-col h-full">
                  <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600" />{quarterLabel}
                    </CardTitle>
                    <StatusBadge status={form.status} />
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Objectives</span><span className="font-medium text-gray-900">{objCount}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Submitted</span><span className="font-medium text-gray-900">{submittedDate}</span></div>
                      {form.submissionCount > 1 && (
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Submission #</span><span className="font-medium text-orange-600">{form.submissionCount} (Resubmitted)</span></div>
                      )}
                    </div>
                    <div className={`p-3 rounded-md text-sm border font-medium text-center mt-auto ${cta.bg}`}>{cta.text}</div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MboListPage;
