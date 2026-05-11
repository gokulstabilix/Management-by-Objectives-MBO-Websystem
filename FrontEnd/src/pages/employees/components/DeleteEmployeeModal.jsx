import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const DeleteEmployeeModal = ({ employee, onClose, onConfirm, isDeleting }) => {
  const [confirmName, setConfirmName] = useState('');
  const nameMatches = confirmName.trim().toLowerCase() === (employee?.name || '').trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Employee?</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            You are about to permanently delete <strong>{employee?.name}</strong>.
            This action cannot be undone.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Warning:</strong> All associated data including mentor mappings will be removed.
              MBO form history will be retained for audit purposes.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type the employee name to confirm:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={employee?.name}
              autoFocus
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            disabled={!nameMatches || isDeleting}
            isLoading={isDeleting}
            onClick={() => onConfirm(employee._id)}
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEmployeeModal;
