import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
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
import DeleteEmployeeModal from './components/DeleteEmployeeModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import { canCreateEmployee, canEditEmployee, canDeleteEmployee } from '../../utils/permissions';

const StatusDot = ({ isActive }) => (
  <span className="flex items-center gap-1.5">
    <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
    <span className="text-sm text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
  </span>
);

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
  const userCanCreate  = canCreateEmployee(role);
  const userCanEdit    = canEditEmployee(role);
  const userCanDelete  = canDeleteEmployee(role); // Admin-only — mirrors backend authorize('admin')

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
        {userCanCreate && (
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
                            {userCanEdit && (
                              <button
                                className="text-gray-400 hover:text-indigo-600 p-1"
                                title="Edit employee"
                                onClick={() => navigate(`/employees/${emp._id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {/* Delete is Admin-only — HR cannot delete employees */}
                            {userCanDelete && (
                              <button
                                className="text-gray-400 hover:text-red-600 p-1"
                                title="Delete employee (Admin only)"
                                onClick={(e) => handleDeleteClick(e, emp)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
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
