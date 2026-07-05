import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            {icon}
          </span>
        )}
        <input
          className={cn(
            "w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors",
            "placeholder:text-stone-400 text-stone-900",
            "focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400",
            error ? "border-red-400" : "border-stone-300",
            icon && "pl-9",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors resize-none",
          "placeholder:text-stone-400 text-stone-900",
          "focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400",
          error ? "border-red-400" : "border-stone-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-stone-700">{label}</label>
      )}
      <select
        className={cn(
          "w-full px-3 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors cursor-pointer",
          "text-stone-900",
          "focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400",
          error ? "border-red-400" : "border-stone-300",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}