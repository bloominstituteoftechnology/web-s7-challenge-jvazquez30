import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';

// Validation errors
const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S or M or L'
};

// Form schema
const formSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .max(20, validationErrors.fullNameTooLong)
    .min(3, validationErrors.fullNameTooShort),
  size: yup
    .string()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
  toppings: yup
    .array()
    .of(yup.string())
});

// Toppings data
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

export default function Form() {
  const [values, setValues] = useState({
    fullName: "",
    size: "",
    toppings: []
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [failure, setFailure] = useState("");
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    formSchema.isValid(values).then(valid => setDisabled(!valid));
  }, [values]);

  const onChange = evt => {
    const { name, value, checked, type } = evt.target;
    if (type === 'checkbox') {
      const newToppings = checked
        ? [...values.toppings, value]
        : values.toppings.filter(t => t !== value);
      setValues({ ...values, toppings: newToppings });
    } else {
      setValues({ ...values, [name]: value });
    }

    // Validate the field
    yup.reach(formSchema, name)
      .validate(type === 'checkbox' ? values.toppings : value)
      .then(() => setErrors({ ...errors, [name]: '' }))
      .catch(err => setErrors({ ...errors, [name]: err.errors[0] }));
  };

  const onSubmit = evt => {
    evt.preventDefault();
    axios.post("http://localhost:9009/api/order", values)
      .then(res => {
        setSuccess(res.data.message);
        setFailure("");
        setValues({
          fullName: "",
          size: "",
          toppings: []
        })
      }).catch(err => {
        setFailure(err.response.data.message || "An error occurred");
        setSuccess("");
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <label htmlFor="fullName">Full Name</label><br />
        <input
          placeholder="Type full name"
          id="fullName"
          type="text"
          name="fullName"
          value={values.fullName}
          onChange={onChange}
        />
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <label htmlFor="size">Size</label><br />
        <select id="size" name="size" value={values.size} onChange={onChange}>
          <option value="">----Choose Size----</option>
          <option value='S'>Small</option>
          <option value='M'>Medium</option>
          <option value='L'>Large</option>
        </select>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map(topping => (
          <label key={topping.topping_id}>
            <input
              name="toppings"
              type="checkbox"
              value={topping.topping_id}
              checked={values.toppings.includes(topping.topping_id)}
              onChange={onChange}
            />
            {topping.text}<br />
          </label>
        ))}
      </div>

      <input type="submit" disabled={disabled} />
    </form>
  );
}
