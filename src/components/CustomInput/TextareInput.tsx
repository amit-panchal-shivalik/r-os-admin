import React, { useEffect, useState } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { TextareaInputProps } from '../../types/CustomInputTypes';

const TextareaInput: React.FC<TextareaInputProps> = ({
  id,
  label,
  register,
  errors,
  value,
  onChange,
  setValue,
  required,
  readOnly,
  disabled,
  maxLength,
  rows = 4,
}) => {
  const error = errors?.[id]?.message as string | undefined;
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || (!!value && value.length > 0);

  const validationRules: RegisterOptions = {
    ...(required ? { required: `${label} is required` } : {}),
  };

  useEffect(() => {
    if (register) {
      register(id, validationRules);
    }

    if (value !== undefined) {
      setValue?.(id, value, { shouldValidate: true });
    }
  }, [register, setValue, id, value, required]);

  return (
    <div>
      <label htmlFor={id} className="standard-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        aria-label={label}
        placeholder={`Enter ${label.toLowerCase()}`}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={`standard-input resize-y min-h-[2.5rem] ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        // INFO: Managed Controlled and UnControlled together
        {...(onChange
          ? {
            value: value ?? '',
            onChange: (e) => {
              onChange(e);
              setValue?.(id, e.target.value, { shouldValidate: true, shouldTouch: true });
            },
          }
          : register && register(id, validationRules))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TextareaInput;