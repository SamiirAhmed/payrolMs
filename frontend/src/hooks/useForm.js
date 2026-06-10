import { useState } from "react";

export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (callback) => (event) => {
    event.preventDefault();
    const nextErrors = validate ? validate(values) : {};
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      callback(values);
    }
  };

  return { values, setValues, errors, setErrors, handleChange, handleSubmit };
}
