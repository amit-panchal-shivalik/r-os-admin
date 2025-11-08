import { NewDateInputProps } from '@/types/CustomInputTypes';
import React, { useState } from 'react';

const DateInput: React.FC<NewDateInputProps> = ({
  id,
  label,
  register,
  setValue,
  errors,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errors[id];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    const parts = inputValue.split('-');
    if (parts.length === 3) {
      let [year, month, day] = parts;
      if (year.length > 4) year = year.slice(0, 4);
      inputValue = [year, month, day].join('-');
    }
    setValue(id, inputValue);
  };

  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const parts = pasted.split('-');
    if (parts.length === 3 && parts[0].length > 4) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <label htmlFor={id} className="standard-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        id={id}
        placeholder="Select date"
        className={`standard-input ${hasError ? 'error' : ''}`}
        {...register(id, { required })}
        onChange={handleDateChange}
        onPaste={handleDatePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {hasError && (
        <p className="error-message">{errors[id]?.message as string}</p>
      )}
    </div>
  );
};

export default DateInput;