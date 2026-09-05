interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`toggle-switch ${checked ? 'toggle-switch-on' : ''}`}
    >
      <span className="toggle-switch-knob" />
    </button>
  );
}