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
    <div className="floating-input-container">
      <input
        type="date"
        id={id}
        placeholder=""
        className={hasError ? 'error' : ''}
        {...register(id, { required })}
        onChange={handleDateChange}
        onPaste={handleDatePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <label htmlFor={id}>
        {label} {required && <span className="text-black">*</span>}
      </label>
      {hasError && (
        <p className="error-message">{errors[id]?.message as string}</p>
      )}
    </div>
  );
};

export default DateInput;