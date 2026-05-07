import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Info, Network } from 'lucide-react';
import {
  fetchMappingsThunk, assignMentorThunk, updateMentorThunk, removeMentorThunk,
  selectMappings, selectMentorMapLoading, selectMentorMapSubmitting,
} from '../../store/slices/mentorMapSlice';
import { fetchEmployeesThunk, selectEmployees } from '../../store/slices/employeeSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LevelBadge from '../../components/shared/LevelBadge';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const MentorMapPage = () => {
  const dispatch = useDispatch();
  const mappings = useSelector(selectMappings);
  const allEmployees = useSelector(selectEmployees);
  const isLoading = useSelector(selectMentorMapLoading);
  const isSubmitting = useSelector(selectMentorMapSubmitting);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'assigned' | 'unassigned'
  const [selectedMentorId, setSelectedMentorId] = useState('');

  useEffect(() => {
    dispatch(fetchMappingsThunk());
    // Load all users to populate mentor dropdown (Lead level or above)
    dispatch(fetchEmployeesThunk({ limit: 100 }));
  }, [dispatch]);

  // Update selected employee's mentor dropdown when selection changes
  useEffect(() => {
    if (selectedEmployee) {
      setSelectedMentorId(selectedEmployee.mentorId?._id || selectedEmployee.mentorId || '');
    } else {
      setSelectedMentorId('');
    }
  }, [selectedEmployee]);

  // Potential mentors: Lead level users (excluding the selected employee)
  const potentialMentors = allEmployees.filter(
    emp => ['Lead', 'Senior'].includes(emp.level) && emp._id !== selectedEmployee?._id && emp.isActive
  );

  const filteredMappings = mappings.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.level?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterMode === 'all' ||
      (filterMode === 'assigned' && emp.mentorId) ||
      (filterMode === 'unassigned' && !emp.mentorId);
    return matchesSearch && matchesFilter;
  });

  const unassignedCount = mappings.filter(emp => !emp.mentorId && emp.role === 'employee').length;

  const handleSaveAssignment = async () => {
    if (!selectedEmployee) return;
    if (!selectedMentorId) {
      toast.error('Please select a mentor to assign.');
      return;
    }

    const isUpdate = !!selectedEmployee.mentorId;
    const action = isUpdate
      ? updateMentorThunk({ employeeId: selectedEmployee._id, mentorId: selectedMentorId })
      : assignMentorThunk({ employeeId: selectedEmployee._id, mentorId: selectedMentorId });

    const result = await dispatch(action);
    if (!result.error) {
      toast.success(`Mentor ${isUpdate ? 'updated' : 'assigned'} successfully!`);
      dispatch(fetchMappingsThunk()); // Refresh list
      setSelectedEmployee(null);
    } else {
      toast.error(result.payload || 'Failed to save assignment');
    }
  };

  const handleRemoveMentor = async () => {
    if (!selectedEmployee) return;
    if (window.confirm(`Remove mentor from ${selectedEmployee.name}? Their MBO history is preserved.`)) {
      const result = await dispatch(removeMentorThunk(selectedEmployee._id));
      if (!result.error) {
        toast.success('Mentor removed. MBO history preserved.');
        dispatch(fetchMappingsThunk());
        setSelectedEmployee(null);
      } else {
        toast.error(result.payload || 'Failed to remove mentor');
      }
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mentor Mapping</h1>
        <p className="text-sm text-gray-500">Assign and manage mentor-mentee relationships across the organization.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

        {/* Left Panel - Employee List */}
        <Card className="w-full lg:w-1/3 flex flex-col overflow-hidden">
          <CardHeader className="bg-gray-50 border-b flex-shrink-0">
            <CardTitle>All Employees</CardTitle>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by name or level..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Badge
                variant={filterMode === 'all' ? 'primary' : 'default'}
                className="cursor-pointer"
                onClick={() => setFilterMode('all')}
              >
                All ({mappings.length})
              </Badge>
              <Badge
                variant={filterMode === 'assigned' ? 'primary' : 'default'}
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => setFilterMode('assigned')}
              >
                Assigned
              </Badge>
              <Badge
                variant={filterMode === 'unassigned' ? 'warning' : 'default'}
                className="cursor-pointer bg-orange-100 text-orange-800 border-orange-200"
                onClick={() => setFilterMode('unassigned')}
              >
                Unassigned ({unassignedCount})
              </Badge>
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredMappings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No employees found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMappings.map(emp => (
                  <div
                    key={emp._id}
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                      selectedEmployee?._id === emp._id
                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                        {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{emp.name}</h4>
                        {emp.mentorId ? (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Mentor: {emp.mentorId?.name || 'Assigned'}
                          </p>
                        ) : (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-medium rounded">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                    {emp.level && <LevelBadge level={emp.level} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel - Assignment Form */}
        <Card className="w-full lg:w-2/3 flex flex-col overflow-hidden bg-gray-50/50">
          <CardHeader className="bg-white border-b flex-shrink-0">
            <CardTitle>Mentor Assignment</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {selectedEmployee ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                {/* Employee Header */}
                <Card className="shadow-sm border-indigo-100">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl flex-shrink-0">
                      {selectedEmployee.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                      <div className="flex items-center gap-2 mt-1 mb-3 text-sm text-gray-600">
                        {selectedEmployee.level && <LevelBadge level={selectedEmployee.level} />}
                        {selectedEmployee.department && (
                          <>
                            <span>•</span>
                            <span>{selectedEmployee.department} Dept</span>
                          </>
                        )}
                      </div>

                      {!selectedEmployee.mentorId && (
                        <div className="bg-indigo-50 text-indigo-800 p-3 rounded-md text-sm flex gap-2 border border-indigo-100">
                          <Info className="h-5 w-5 flex-shrink-0 text-indigo-600" />
                          <p>No mentor currently assigned.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Assignment Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    {selectedEmployee.mentorId ? 'Update Mentor' : 'Assign New Mentor'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Select Mentor (Senior / Lead Level)
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-3 text-sm"
                        value={selectedMentorId}
                        onChange={e => setSelectedMentorId(e.target.value)}
                      >
                        <option value="">— Search and select a mentor —</option>
                        {potentialMentors.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.level}{m.department ? `, ${m.department}` : ''})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        Mentors must be at Senior or Lead level.
                      </p>
                    </div>

                    <div className="pt-6 border-t flex justify-between items-center gap-3">
                      <div>
                        {selectedEmployee.mentorId && (
                          <Button
                            variant="secondary"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={handleRemoveMentor}
                            isLoading={isSubmitting}
                          >
                            Remove Mentor
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setSelectedEmployee(null)}>Cancel</Button>
                        <Button onClick={handleSaveAssignment} isLoading={isSubmitting}>
                          Save Assignment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-48">
                <Network className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No Employee Selected</h3>
                <p className="text-sm mt-1">Select an employee from the left panel to assign a mentor.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MentorMapPage;
