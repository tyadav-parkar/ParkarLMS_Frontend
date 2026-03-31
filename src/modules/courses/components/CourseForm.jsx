export const COURSE_CATEGORIES = [
  'Technical', 'Certification', 'Soft Skills',
  'Leadership', 'Management', 'Cloud', 'Architecture',
];

export const COURSE_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const DIFFICULTY_COLORS = {
  Beginner:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50   text-amber-700   border-amber-200',
  Advanced:     'bg-red-50     text-red-700     border-red-200',
};

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
      {hint  && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition placeholder-gray-300';

export default function CourseForm({ form, setForm, formError, saving, onSubmit, onCancel, isEdit = false }) {
  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* ── Title ── */}
      <Field label="Course Title" hint="Keep this concise and unique among active courses.">
        <input
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          required minLength={2} maxLength={255}
          placeholder="e.g. Advanced React Patterns"
          className={inputCls}
        />
      </Field>

      {/* ── Category + Difficulty ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select value={form.category} onChange={(e) => updateField('category', e.target.value)} className={inputCls}>
            <option value="">Select category</option>
            {COURSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Difficulty">
          <div className="flex gap-2 flex-wrap pt-0.5">
            {COURSE_DIFFICULTIES.map((d) => (
              <button
                key={d} type="button"
                onClick={() => updateField('difficulty', d)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  form.difficulty === d
                    ? DIFFICULTY_COLORS[d]
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* ── Provider + Duration ── */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Provider">
          <input
            value={form.provider}
            onChange={(e) => updateField('provider', e.target.value)}
            maxLength={100} placeholder="e.g. Udemy, Coursera"
            className={inputCls}
          />
        </Field>

        <Field label="Duration (Hours)" hint="Use decimals e.g. 20.5 hours.">
          <input
            type="number" step="0.5" min="0"
            value={form.estimatedDurationHours}
            onChange={(e) => updateField('estimatedDurationHours', e.target.value)}
            placeholder="e.g. 20"
            className={inputCls}
          />
        </Field>
      </div>

      {/* ── External URL ── */}
      <Field label="External URL">
        <input
          type="url"
          value={form.externalUrl}
          onChange={(e) => updateField('externalUrl', e.target.value)}
          placeholder="https://..."
          className={inputCls}
        />
      </Field>

      {/* ── Description ── */}
      <Field label="Description">
        <textarea
          rows={3} value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="What will employees learn from this course?"
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* ── Prerequisites ── */}
      <Field label="Prerequisites">
        <textarea
          rows={2} value={form.prerequisites}
          onChange={(e) => updateField('prerequisites', e.target.value)}
          placeholder="Any prior knowledge required?"
          className={`${inputCls} resize-none`}
        />
      </Field>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{formError}</div>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white disabled:opacity-60 transition-colors shadow-sm">
          {saving ? 'Saving…' : isEdit ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}