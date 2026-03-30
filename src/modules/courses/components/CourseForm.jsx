export const COURSE_CATEGORIES = [
  'Technical',
  'Certification',
  'Soft Skills',
  'Leadership',
  'Management',
  'Cloud',
  'Architecture',
];

export const COURSE_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function CourseForm({
  form,
  setForm,
  formError,
  saving,
  onSubmit,
  onCancel,
  isEdit = false,
}) {
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
          minLength={2}
          maxLength={255}
          aria-label="Course title"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
          placeholder="Course title"
        />
        <p className="text-xs text-gray-500 mt-1">Keep this concise and unique among active courses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            aria-label="Course category"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
          >
            <option value="">Select category</option>
            {COURSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => updateField('difficulty', e.target.value)}
            aria-label="Course difficulty"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
          >
            {COURSE_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <input
            value={form.provider}
            onChange={(e) => updateField('provider', e.target.value)}
            maxLength={100}
            aria-label="Course provider"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="e.g. Udemy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (Months)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={form.estimatedDurationMonths}
            onChange={(e) => updateField('estimatedDurationMonths', e.target.value)}
            aria-label="Estimated duration in months"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
            placeholder="e.g. 2.5"
          />
          <p className="text-xs text-gray-500 mt-1">Use decimals if needed, for example 1.5 months.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">External URL</label>
        <input
          type="url"
          value={form.externalUrl}
          onChange={(e) => updateField('externalUrl', e.target.value)}
          aria-label="External course URL"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          aria-label="Course description"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700 resize-none"
          placeholder="Course description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
        <textarea
          rows={2}
          value={form.prerequisites}
          onChange={(e) => updateField('prerequisites', e.target.value)}
          aria-label="Course prerequisites"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-700 resize-none"
          placeholder="Prerequisites"
        />
      </div>

      {formError && <p className="text-sm text-red-500">{formError}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
