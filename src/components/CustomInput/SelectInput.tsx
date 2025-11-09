import React, { useEffect } from 'react';
import { SelectInputProps } from '@/types/CustomInputTypes';

const SelectInput: React.FC<SelectInputProps> = ({ id, label, register, errors, setValue, required, options, onChange, validate, value, mode = 'create', disabled = false }) => {

    const error = errors?.[id]?.message as string | undefined;
    const fieldName = id && id.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

    useEffect(() => {
        if (register && mode === 'edit') {
            register(id, {
                validate: (val: string) => {
                    return validate ? validate(val) : (!!val || `${fieldName} is required`);
                },
            });

            if (value) {
                setValue?.(id, value, {
                    shouldValidate: true,
                    shouldDirty: false,
                });
            }
        }
    }, [register, setValue, id, value, validate, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value === 'unset' ? '' : e.target.value;

        setValue?.(id, selectedValue, {
            shouldValidate: true,
            shouldTouch: true,
        });

        onChange?.(e);
    };

    const selectProps =
        register
            ? {
                ...register(id, {
                    validate: (val: string) => {
                        return validate ? validate(val) : (!!val || `${fieldName} is required`);
                    },
                }),
                onChange: handleChange,
            }
            : {
                name: id,
                value: value ?? '',
                onChange: handleChange,
            };

    return (
        <div className="relative">
            <label htmlFor={id} className="standard-label">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={id}
                aria-label={label}
                {...selectProps}
                disabled={disabled}
                className={`w-full px-4 py-3 pr-10 border rounded-lg appearance-none cursor-pointer bg-background focus:outline-none focus:ring-1 focus:ring-design-primary text-foreground ${error ? 'border-red-500' : 'border'} ${disabled ? 'cursor-not-allowed bg-muted opacity-70 text-muted-foreground' : ''}`}
            >
                <option value="" disabled hidden>
                    Select an option
                </option>
                {!disabled && <option value="unset">Unset</option>}
                {options?.map((opt) => (
                    <option key={opt?.value} value={opt?.value}>
                        {opt?.label}
                    </option>
                ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 bottom-3 transform pointer-events-none">
                <svg
                    className={`w-5 h-5 transition-transform duration-200 ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default SelectInput;

// INFO: Reference code for future
// TODO: Remove once all stable

// const SelectInput: React.FC<SelectInputProps> = ({
//     id,
//     label,
//     register,
//     errors,
//     setValue,
//     required,
//     options,
//     onChange,
//     validate,
//     value,
//     mode = 'create',
//     disabled = false,
//     status = 'complete',
//     loadingMessage,
//     failedMessage,
//     noOptionsMessage,
// }) => {
//     const error = errors?.[id]?.message as string | undefined;

//     useEffect(() => {
//         if (register && mode === 'edit') {
//             register(id, {
//                 validate: (val: string) => validate ? validate(val) : (!!val || 'This field is required'),
//             });

//             if (value) {
//                 setValue?.(id, value, {
//                     shouldValidate: true,
//                     shouldDirty: false,
//                 });
//             }
//         }
//     }, [register, setValue, id, value, validate, mode]);

//     const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const selectedValue = e.target.value === 'unset' ? '' : e.target.value;
//         setValue?.(id, selectedValue, {
//             shouldValidate: true,
//             shouldTouch: true,
//         });
//         onChange?.(e);
//     };

//     const selectProps = register
//         ? {
//             ...register(id, {
//                 validate: (val: string) => validate ? validate(val) : (!!val || 'This field is required'),
//             }),
//             onChange: handleChange,
//         }
//         : {
//             name: id,
//             value: value ?? '',
//             onChange: handleChange,
//         };

//     return (
//         <div className="input-wrapper">
//             <select
//                 id={id}
//                 aria-label={label}
//                 {...selectProps}
//                 disabled={disabled}
//                 className={`custom-input ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
//             >
//                 <option value="" disabled hidden></option>
//                 {!disabled && <option value="unset">Unset</option>}

//                 {status === 'pending' && <option disabled>{loadingMessage || 'Loading...'}</option>}
//                 {status === 'failed' && <option disabled>{failedMessage || 'Failed to load data'}</option>}
//                 {status === 'complete' && options?.length > 0 ? (
//                     options.map((opt: any) => (
//                         <option key={opt?.value} value={opt?.value}>
//                             {opt?.label}
//                         </option>
//                     ))
//                 ) : (
//                     status === 'complete' && <option disabled>{noOptionsMessage || 'No options available'}</option>
//                 )}
//             </select>

//             <span className="material-label">
//                 {label} {required && '*'}
//             </span>
//             {error && <p className="error-message">{error}</p>}
//         </div>
//     );
// };

// export default SelectInput;
