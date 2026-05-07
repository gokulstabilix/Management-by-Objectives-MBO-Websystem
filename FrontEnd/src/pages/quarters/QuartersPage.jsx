import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, Plus, X, AlertTriangle } from 'lucide-react';
import {
  fetchQuartersThunk, createQuarterThunk, closeQuarterThunk,
  selectQuarters, selectActiveQuarter, selectQuartersLoading, selectQuartersSubmitting,
} from '../../store/slices/quarterSlice';
import { Card, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const QuartersPage = () => {
  const dispatch = useDispatch();
  const quarters = useSelector(selectQuarters);
  const activeQuarter = useSelector(selectActiveQuarter);
  const isLoading = useSelector(selectQuartersLoading);
  const isSubmitting = useSelector(selectQuartersSubmitting);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuarterLabel, setNewQuarterLabel] = useState('');

  useEffect(() => {
    dispatch(fetchQuartersThunk());
  }, [dispatch]);

  const hasOpenQuarter = !!activeQuarter;

  const handleOpenQuarter = async (e) => {
    e.preventDefault();

    if (hasOpenQuarter) {
      toast.error('Close the current open quarter before starting a new one.');
      return;
    }

    // Validate format QX-YYYY
    if (!/^Q[1-4]-\d{4}$/.test(newQuarterLabel)) {
      toast.error('Label must be in format QX-YYYY (e.g., Q3-2026)');
      return;
    }

    const result = await dispatch(createQuarterThunk(newQuarterLabel));
    if (!result.error) {
      toast.success(`${newQuarterLabel} has been opened successfully.`);
      setIsModalOpen(false);
      setNewQuarterLabel('');
    } else {
      toast.error(result.payload || 'Failed to open quarter');
    }
  };

  const handleCloseQuarter = async (id, label) => {
    if (window.confirm(`Closing ${label} will freeze all Draft and Submitted forms. This cannot be undone. Proceed?`)) {
      const result = await dispatch(closeQuarterThunk(id));
      if (!result.error) {
        toast.success('Quarter closed and forms frozen.');
      } else {
        toast.error(result.payload || 'Failed to close quarter');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quarters</h1>
          <p className="text-sm text-gray-500">Manage organizational planning periods and MBO cycles.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2" disabled={isLoading}>
          <Plus className="h-4 w-4" /> Open New Quarter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-500">Loading quarters...</span>
            </div>
          ) : quarters.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No quarters yet</p>
              <p className="text-sm mt-1">Open the first quarter to begin the MBO cycle.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Opened By</th>
                    <th className="px-6 py-4">Opened At</th>
                    <th className="px-6 py-4">Closed At</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quarters.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          {q.status === 'open' && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>}
                          {q.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={q.status === 'open' ? 'Open' : 'Closed'} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          {q.openedBy ? (
                            <>
                              <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-medium">
                                {q.openedBy?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                              </div>
                              {q.openedBy?.name || '—'}
                            </>
                          ) : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(q.openedAt)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(q.closedAt)}</td>
                      <td className="px-6 py-4">
                        {q.status === 'open' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleCloseQuarter(q._id, q.label)}
                            isLoading={isSubmitting}
                          >
                            Close Quarter
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open New Quarter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Open New Quarter</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleOpenQuarter} className="p-6 space-y-4">
              <Input
                label="Quarter Label"
                placeholder="e.g. Q4-2026"
                value={newQuarterLabel}
                onChange={(e) => setNewQuarterLabel(e.target.value.toUpperCase())}
                required
              />
              <p className="text-xs text-gray-500 -mt-2">Format: QX-YYYY (e.g., Q3-2026)</p>

              {hasOpenQuarter && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{activeQuarter.label}</strong> is currently open. Close it before opening a new quarter.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={hasOpenQuarter} isLoading={isSubmitting}>
                  Confirm &amp; Open
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuartersPage;
