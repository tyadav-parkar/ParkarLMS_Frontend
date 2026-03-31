import { useMemo, useState, useCallback } from 'react';
import { CalendarDays, StickyNote, Filter, X } from 'lucide-react';
import { Modal } from '@shared';
import EligibleEmployeesPicker from './EligibleEmployeesPicker';

const inputCls  = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition placeholder-gray-300';
const selectCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition';

const DEFAULT_FILTERS = { search: '', role: '', role_id: '', department: '', department_id: '' };
const todayStr = new Date().toISOString().split('T')[0];

export default function AssignmentModal({
  course,
  onClose,
  onSubmit,
  loading,
  error,
  employees,
  selectedIds,
  onToggleEmployee,
  onFilterChange,         // (filters, page, append) => void
  saving,
  employeesHasMore      = false,
  employeesLoadingMore  = false,
  totalEligibleEmployees = 0,  // total count from backend
  onSelectAll           = null,  // (visibleIds) => void
  onDeselectAll         = null,  // () => void
  onSelectAllPages      = null,  // async () => void — fetches ALL ids
  departments           = [],
  roles                 = [],
}) {
  const [dueDate,        setDueDate]        = useState('');
  const [notes,          setNotes]          = useState('');
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [currentPage,    setCurrentPage]    = useState(1);

  const hasActiveFilters = Object.values(appliedFilters).some((v) => v !== '');
  const hasDropdowns     = departments.length > 0 || roles.length > 0;

  const canSubmit = useMemo(
    () => dueDate && selectedIds.length > 0 && !saving,
    [dueDate, selectedIds.length, saving]
  );

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleRoleChange(e) {
    const selected = roles.find((r) => String(r.id) === e.target.value);
    setFilters((prev) => ({ ...prev, role_id: e.target.value, role: selected?.name || '' }));
  }

  function handleDepartmentChange(e) {
    const selected = departments.find((d) => String(d.id) === e.target.value);
    setFilters((prev) => ({ ...prev, department_id: e.target.value, department: selected?.name || '' }));
  }

  function buildFilterPayload(f) {
    return {
      search:        f.search        || undefined,
      role:          f.role          || undefined,
      role_id:       f.role_id       || undefined,
      department:    f.department    || undefined,
      department_id: f.department_id || undefined,
    };
  }

  function handleApplyFilters() {
    setAppliedFilters(filters);
    setCurrentPage(1);
    onFilterChange(buildFilterPayload(filters), 1, false);
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    onFilterChange({}, 1, false);
  }

  const handleLoadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    onFilterChange(buildFilterPayload(appliedFilters), nextPage, true);
  }, [currentPage, appliedFilters, onFilterChange]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ employeeIds: selectedIds, dueDate: dueDate || null, notes: notes || null });
    setDueDate('');
    setNotes('');
  }

  return (
    <Modal title={`Assign — ${course.title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Course badge ── */}
        <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[#0f2236] text-xs font-bold">
              {course.title?.[0]?.toUpperCase() ?? 'C'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-cyan-900 truncate">{course.title}</p>
            <p className="text-xs text-cyan-600">
              {course.category || 'No category'} · {course.difficulty || 'N/A'}
            </p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Employees</p>
              {hasActiveFilters && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 text-cyan-700">
                  Active
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button type="button" onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors">
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>

          {hasDropdowns ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Search</label>
                <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Name or email" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
                <select value={filters.role_id} onChange={handleRoleChange} className={selectCls}>
                  <option value="">All Roles</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</label>
                <select value={filters.department_id} onChange={handleDepartmentChange} className={selectCls}>
                  <option value="">All Departments</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Search',     key: 'search',     placeholder: 'Name or email'    },
                { label: 'Role',       key: 'role',       placeholder: 'e.g. Manager'     },
                { label: 'Department', key: 'department', placeholder: 'e.g. Engineering' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                  <input value={filters[key]} onChange={(e) => updateFilter(key, e.target.value)} placeholder={placeholder} className={inputCls} />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={handleApplyFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200">
              <Filter className="w-3.5 h-3.5" /> Apply Filters
            </button>
          </div>
        </div>

        {/* ── Employee picker ── */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Recipients</p>
          <EligibleEmployeesPicker
            employees={employees}
            loading={loading}
            loadingMore={employeesLoadingMore}
            hasMore={employeesHasMore}
            onLoadMore={handleLoadMore}
            selectedIds={selectedIds}
            onToggle={onToggleEmployee}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
            totalEligible={totalEligibleEmployees}
            onSelectAllPages={onSelectAllPages}
          />
        </div>

        {/* ── Due date + selected count ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <CalendarDays className="w-3.5 h-3.5" /> Due Date <span className="text-red-500">*</span>
            </label>
            <input type="date" value={dueDate} min={todayStr} onChange={(e) => setDueDate(e.target.value)} required
              className={`${inputCls} ${!dueDate ? 'border-red-300 bg-red-50 focus:ring-red-400 focus:border-red-400' : ''}`}
            />
            {!dueDate && <p className="text-xs text-red-500">Required to assign this course.</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Selected</label>
            <div className={`flex items-center justify-center h-[42px] rounded-xl border text-sm font-bold ${
              selectedIds.length > 0 ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              {selectedIds.length > 0
                ? `${selectedIds.length} employee${selectedIds.length !== 1 ? 's' : ''}`
                : 'None selected'}
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <StickyNote className="w-3.5 h-3.5" /> Notes
          </label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for the assignees…"
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-50 transition-colors shadow-sm">
            {saving
              ? 'Assigning…'
              : `Assign to ${selectedIds.length > 0 ? selectedIds.length : ''} Employee${selectedIds.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}