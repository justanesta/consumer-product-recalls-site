import type { DistributionScope } from '@/lib/api/recalls';
import { classificationsForSources } from '@/lib/domain/classification-vocab';
import { SOURCE_ORDER } from '@/lib/domain/sources';
import type { RecallFilters, StatusFilter } from '@/lib/recalls/filters';

const SCOPES: DistributionScope[] = ['Nationwide', 'Regional', 'Unspecified', 'International'];
const STATUSES: StatusFilter[] = ['any', 'active', 'inactive'];
const INPUT = 'mt-1 w-full rounded border border-line bg-paper px-2 py-1.5 text-sm';

interface Props {
  value: RecallFilters;
  onChange: (next: RecallFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function FiltersPanel({ value, onChange, onApply, onClear }: Props) {
  const set = (patch: Partial<RecallFilters>) => onChange({ ...value, ...patch });
  const classOptions = classificationsForSources(value.source);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
      className="space-y-4 rounded-lg border border-line bg-surface p-4"
      aria-label="Recall filters"
    >
      <div>
        <label htmlFor="f-q" className="block text-sm font-medium">
          Keyword
        </label>
        <input
          id="f-q"
          type="search"
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="e.g. lithium battery"
          className={INPUT}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Source</legend>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {SOURCE_ORDER.map((s) => (
            <label key={s} className="inline-flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={value.source.includes(s)}
                onChange={() => set({ source: toggle(value.source, s), classification: [] })}
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      {classOptions.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium">
            Classification <span className="font-normal text-muted">(source-native)</span>
          </legend>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {classOptions.map((c) => (
              <label key={c} className="inline-flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={value.classification.includes(c)}
                  onChange={() => set({ classification: toggle(value.classification, c) })}
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="text-sm font-medium">Status</legend>
        <div className="mt-1 flex gap-3 text-sm">
          {STATUSES.map((s) => (
            <label key={s} className="inline-flex items-center gap-1.5 capitalize">
              <input
                type="radio"
                name="status"
                checked={value.status === s}
                onChange={() => set({ status: s })}
              />
              {s === 'any' ? 'Any' : s}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Distribution scope</legend>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {SCOPES.map((s) => (
            <label key={s} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={value.distribution_scope.includes(s)}
                onChange={() => set({ distribution_scope: toggle(value.distribution_scope, s) })}
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="f-after" className="block text-sm font-medium">
            Published after
          </label>
          <input
            id="f-after"
            type="date"
            value={value.published_after}
            onChange={(e) => set({ published_after: e.target.value })}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="f-before" className="block text-sm font-medium">
            Published before
          </label>
          <input
            id="f-before"
            type="date"
            value={value.published_before}
            onChange={(e) => set({ published_before: e.target.value })}
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label htmlFor="f-firm" className="block text-sm font-medium">
          Firm <span className="font-normal text-muted">(primary name)</span>
        </label>
        <input
          id="f-firm"
          type="text"
          value={value.firm}
          onChange={(e) => set({ firm: e.target.value })}
          placeholder="e.g. Ford"
          className={INPUT}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-line px-4 py-1.5 text-sm"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
