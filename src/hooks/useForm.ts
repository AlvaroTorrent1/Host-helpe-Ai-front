/**
 * src/hooks/useForm.ts
 * Hook for easier form handling with validation
 */

import { useState, useCallback, FormEvent } from 'react';

/**
 * Validation function type
 */
export type Validator<T> = (value: T) => string | null;

/**
 * Field configuration
 */
export interface FieldConfig<T> {
  initialValue: T;
  validators?: Validator<T>[];
  transform?: (value: any) => T;
}

/**
 * Form field state
 */
interface FieldState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form field methods
 */
interface FieldMethods<T> {
  setValue: (value: T) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  validate: () => boolean;
  setTouched: (touched?: boolean) => void;
}

/**
 * Form state
 */
export type FormState<T> = {
  [K in keyof T]: FieldState<T[K]>;
};

/**
 * Form methods
 */
export type FormMethods<T> = {
  [K in keyof T]: FieldMethods<T[K]>;
};

/**
 * Form values
 */
export type FormValues<T> = {
  [K in keyof T]: T[K];
};

/**
 * Form errors
 */
export type FormErrors<T> = {
  [K in keyof T]: string | null;
};

/**
 * Form hook configuration
 */
export interface FormConfig<T> {
  fields: { [K in keyof T]: FieldConfig<T[K]> };
  onSubmit?: (values: FormValues<T>) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form hook return type
 */
export interface FormHook<T> {
  values: FormValues<T>;
  errors: FormErrors<T>;
  touched: { [K in keyof T]: boolean };
  dirty: { [K in keyof T]: boolean };
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (event: any) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string | null) => void;
  resetField: (field: keyof T) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  fields: FormState<T>;
  fieldMethods: FormMethods<T>;
}

/**
 * Hook for easier form handling with validation
 * @param config Form configuration object
 * @returns Form state and helpers
 */
export function useForm<T extends Record<string, any>>(
  config: FormConfig<T>
): FormHook<T> {
  const {
    fields: fieldConfigs,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
  } = config;

  // Initialize form state
  const [fields, setFields] = useState<FormState<T>>(() => {
    const initialFields: Partial<FormState<T>> = {};
    
    for (const key in fieldConfigs) {
      initialFields[key] = {
        value: fieldConfigs[key].initialValue,
        error: null,
        touched: false,
        dirty: false,
      };
    }
    
    return initialFields as FormState<T>;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the form is valid
  const isValid = Object.values(fields).every(
    (field) => !field.error
  );

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const config = fieldConfigs[field];
      const value = fields[field].value;
      
      if (!config.validators || config.validators.length === 0) {
        return true;
      }
      
      for (const validator of config.validators) {
        const errorMessage = validator(value);
        if (errorMessage) {
          setFields((prev) => ({
            ...prev,
            [field]: {
              ...prev[field],
              error: errorMessage,
            },
          }));
          return false;
        }
      }
      
      setFields((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          error: null,
        },
      }));
      return true;
    },
    [fields, fieldConfigs]
  );

  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    
    for (const field in fieldConfigs) {
      if (!validateField(field as keyof T)) {
        isValid = false;
      }
    }
    
    return isValid;
  }, [validateField, fieldConfigs]);

  // Set a field value
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFields((prev) => {
        // Apply transform if provided
        const config = fieldConfigs[field];
        const transformedValue = config.transform ? config.transform(value) : value;
        
        const newValue = {
          ...prev,
          [field]: {
            ...prev[field],
            value: transformedValue,
            dirty: true,
          },
        };
        
        return newValue;
      });
      
      if (validateOnChange) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateField, validateOnChange, fieldConfigs]
  );

  // Set a field error
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string | null) => {
      setFields((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          error,
        },
      }));
    },
    []
  );

  // Reset a field to its initial state
  const resetField = useCallback(
    (field: keyof T) => {
      const config = fieldConfigs[field];
      setFields((prev) => ({
        ...prev,
        [field]: {
          value: config.initialValue,
          error: null,
          touched: false,
          dirty: false,
        },
      }));
    },
    [fieldConfigs]
  );

  // Reset the entire form
  const resetForm = useCallback(() => {
    for (const field in fieldConfigs) {
      resetField(field as keyof T);
    }
  }, [resetField, fieldConfigs]);

  // Mark a field as touched
  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, touched = true) => {
      setFields((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          touched,
        },
      }));
      
      if (validateOnBlur && touched) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateField, validateOnBlur]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      // Mark all fields as touched
      const newFields = { ...fields };
      for (const field in fields) {
        newFields[field] = {
          ...newFields[field],
          touched: true,
        };
      }
      setFields(newFields);
      
      // Validate all fields
      if (!validateForm()) {
        return;
      }
      
      if (onSubmit) {
        const values = {} as FormValues<T>;
        for (const key in fields) {
          values[key] = fields[key].value;
        }
        
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [fields, validateForm, onSubmit]
  );

  // Handle input change events
  const handleChange = useCallback(
    (field: keyof T) => (event: any) => {
      const value = event.target ? event.target.value : event;
      setFieldValue(field, value);
    },
    [setFieldValue]
  );

  // Handle input blur events
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field, true);
    },
    [setFieldTouched]
  );

  // Create convenient values and touched objects
  const values = {} as FormValues<T>;
  const errors = {} as FormErrors<T>;
  const touched = {} as { [K in keyof T]: boolean };
  const dirty = {} as { [K in keyof T]: boolean };
  
  for (const key in fields) {
    values[key] = fields[key].value;
    errors[key] = fields[key].error;
    touched[key] = fields[key].touched;
    dirty[key] = fields[key].dirty;
  }

  // Create field methods for each field
  const fieldMethods = {} as FormMethods<T>;
  for (const key in fieldConfigs) {
    const field = key as keyof T;
    fieldMethods[field] = {
      setValue: (value: T[typeof field]) => setFieldValue(field, value),
      setError: (error: string | null) => setFieldError(field, error),
      reset: () => resetField(field),
      validate: () => validateField(field),
      setTouched: (touched = true) => setFieldTouched(field, touched),
    };
  }

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    resetField,
    resetForm,
    validateField,
    validateForm,
    handleSubmit,
    fields,
    fieldMethods,
  };
}

export default useForm; 