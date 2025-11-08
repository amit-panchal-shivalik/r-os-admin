import React, { useEffect, useState } from "react";
import { TextInputProps } from "../../types/CustomInputTypes";
import { RegisterOptions } from "react-hook-form";
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import metadata from 'libphonenumber-js/metadata.min.json';

const fallbackCountry = {
  code: 'IN',
  callingCode: '+91',
  name: 'India',
};

const TextInput: React.FC<TextInputProps> = ({
    id,
    label,
    register,
    errors,
    value,
    onChange,
    mode = "create",
    setValue,
    readOnly,
    required,
    maxLength,
    type = "text",
    disabled = false,
    validation = {},
    isMobileField,
    isEmailField,
    min,
    country,
}) => {
    const error = errors?.[id]?.message as string | undefined;
    const [isFocused, setIsFocused] = useState(false);
    const isActive = isFocused || (!!value && value.length > 0);

    const validationRules: RegisterOptions = {
        ...(required ? { required: `${label} is required` } : {}),
       validate: (value) => {
        
            if (typeof value === 'string' && isMobileField) {
                let callingCode = '';

                if (typeof country === 'string') {
                    callingCode = country.replace(/\D/g, '');
                } else if (typeof country === 'object' && country?.callingCode) {
                    callingCode = country.callingCode.replace(/\D/g, '');
                } else {
                    callingCode = fallbackCountry.callingCode.replace(/\D/g, '');
                }

                if (!callingCode) {
                    return `Missing country calling code for ${label}`;
                }

                const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');

                const fullNumber = `+${callingCode}${cleanedValue}`

                try {
                    const phoneNumber = parsePhoneNumberFromString(fullNumber);
                    if (!phoneNumber || !phoneNumber.isValid()) {
                        return `Invalid ${label.toLowerCase()}`;
                    }
                    const type = phoneNumber.getType();
                    if (type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
                        return `Invalid ${label.toLowerCase()}`;
                    }
                } catch (e) {
                    console.error('Phone number parsing error:', e);
                    return `Invalid ${label.toLowerCase()}`;
                 }
                } else if (isEmailField) {
                    if (value.trim() === "") {
                        return `${label} cannot be only whitespace`;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const hasConsecutiveDots = value.includes('..');

                    if (!emailRegex.test(value.trim()) || hasConsecutiveDots) {
                        return 'Must be a valid email address';
                    }

            }
            return true;
        }
    };

    useEffect(() => {
        if (mode === 'create' && register) {
            register(id as string, validationRules);
        }

        if (mode === 'edit' && setValue && register) {
            setValue(id as any, value ?? '', { shouldValidate: true });
            register(id as string, validationRules);
        }
    }, [register, setValue, id, value, required, mode]);



    return (
        <div className="floating-input-container">
            <input
                type={type}
                id={id}
                aria-label={label}
                placeholder=""
                disabled={disabled}
                readOnly={readOnly}
                min={min}
                maxLength={maxLength}
                className={`${error ? 'error' : ''} ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
                {...(mode === "create"
                    ? register?.(id, validationRules)
                    : {
                        name: id,
                        value: value ?? "",
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            const newVal = e.target.value;
                            onChange?.(e);
                            setValue?.(id, newVal, { shouldValidate: true });
                        },
                    })}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)} />

            <label htmlFor={id}>
                {label} {required && "*"}
            </label>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default TextInput;
