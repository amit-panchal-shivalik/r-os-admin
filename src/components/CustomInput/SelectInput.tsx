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
        <div className="floating-input-container">
            <select
                id={id}
                aria-label={label}
                {...selectProps}
                disabled={disabled}
                className={`appearance-none cursor-pointer pr-8 bg-white bg-no-repeat bg-right-center bg-[length:12px_12px] ${error ? 'error' : ''} ${disabled ? 'cursor-not-allowed bg-gray-100 opacity-70' : ''}`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23000' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`
                }}
            >
                <option value="" disabled hidden></option>
                {!disabled && <option value="unset">Unset</option>}
                {options?.map((opt) => (
                    <option key={opt?.value} value={opt?.value}>
                        {opt?.label}
                    </option>
                ))}
            </select>
            <label htmlFor={id}>
                {label} {required && '*'}
            </label>
            {error && <p className="error-message">{error}</p>}
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
