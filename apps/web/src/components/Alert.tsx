import type { ApiError } from "../api/api";

export function Alert({
  info,
  error,
  onClear,
}: {
  info?: string;
  error?: ApiError | null;
  onClear?: () => void;
}) {
  if (!info && !error) return null;

  return (
    <div className="alert">
      <div>
        {info && <div className="alertSuccess">{info}</div>}
        {error && (
          <div className="alertError">
            Error ({error.code}): {error.message}
          </div>
        )}
      </div>
      {onClear && (
        <button className="btn btnGhost" type="button" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
