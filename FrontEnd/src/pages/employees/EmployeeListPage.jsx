import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, UserPlus, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { selectUserRole } from '../../store/slices/authSlice';
import {
  fetchEmployeesThunk, deleteEmployeeThunk, createEmployeeThunk,
  selectEmployees, selectEmployeesLoading, selectEmployeeTotal,
  selectEmployeePage, selectEmployeePages,
} from '../../store/slices/employeeSlice';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import LevelBadge from '../../components/shared/LevelBadge';
import RoleBadge from '../../components/shared/RoleBadge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const StatusDot = ({ isActive }) => (
  <span className="flex items-center gap-1.5">
    <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
    <span className="text-sm text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
  </span>
);

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
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

// Simple Add Employee Modal
const AddEmployeeModal = ({ onClose, onSave, isSaving }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', level: '', department: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Backend validator expects 'password' field, which the service maps to passwordHash
    const { ...data } = form;
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
              <input name="name" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.name} onChange={handleChange} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input name="email" type="email" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.email} onChange={handleChange} placeholder="jane@company.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password*</label>
            <input name="password" type="password" required minLength={6} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
              <select name="role" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.role} onChange={handleChange}>
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select name="level" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.level} onChange={handleChange}>
                <option value="">—</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input name="department" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" value={form.department} onChange={handleChange} placeholder="Engineering" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Create Employee</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);
  const employees = useSelector(selectEmployees);
  const isLoading = useSelector(selectEmployeesLoading);
  const total = useSelector(selectEmployeeTotal);
  const page = useSelector(selectEmployeePage);
  const pages = useSelector(selectEmployeePages);

  const isAdminOrHr = ['admin', 'hr'].includes(role);

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEmployees = useCallback(() => {
    const params = { page: currentPage, limit: 10 };
    if (searchTerm) params.search = searchTerm;
    if (levelFilter) params.level = levelFilter;
    dispatch(fetchEmployeesThunk(params));
  }, [dispatch, currentPage, searchTerm, levelFilter]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Debounce search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter]);

  const handleDeleteClick = (e, emp) => {
    e.stopPropagation();
    setDeleteTarget(emp);
  };

  const handleDeleteConfirm = async (id) => {
    setIsDeleting(true);
    const result = await dispatch(deleteEmployeeThunk(id));
    setIsDeleting(false);
    if (!result.error) {
      toast.success('Employee deleted successfully');
      setDeleteTarget(null);
    } else {
      toast.error('Failed to delete. Try again.');
    }
  };

  const handleAddEmployee = async (data) => {
    setIsSaving(true);
    const result = await dispatch(createEmployeeThunk(data));
    setIsSaving(false);
    if (!result.error) {
      toast.success('Employee created successfully!');
      setIsAddModalOpen(false);
      loadEmployees();
    } else {
      toast.error(result.payload || 'Failed to create employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${total} organization member${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        {isAdminOrHr && (
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="bg-white border-b flex flex-col md:flex-row md:items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-md text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-500">Loading employees...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No employees found</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role / Level</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Mentor</th>
                    <th className="px-6 py-4">Status</th>
                    {isAdminOrHr && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/employees/${emp._id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3 flex-shrink-0">
                            {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.name}</p>
                            <p className="text-gray-500 text-xs">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <RoleBadge role={emp.role} />
                          {emp.level && <LevelBadge level={emp.level} />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{emp.department || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${!emp.mentorId ? 'text-orange-500 font-medium' : 'text-gray-600'}`}>
                          {emp.mentorId?.name || (emp.role === 'employee' ? 'Unassigned' : 'N/A')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusDot isActive={emp.isActive} />
                      </td>
                      {isAdminOrHr && (
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              className="text-gray-400 hover:text-indigo-600 p-1"
                              title="Edit"
                              onClick={() => navigate(`/employees/${emp._id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-600 p-1"
                              title="Delete"
                              onClick={(e) => handleDeleteClick(e, emp)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">
              Page {page} of {pages} ({total} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= pages || isLoading}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddEmployee}
          isSaving={isSaving}
        />
      )}

      {deleteTarget && (
        <DeleteEmployeeModal
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default EmployeeListPage;
