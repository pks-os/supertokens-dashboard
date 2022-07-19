/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
*
* This software is licensed under the Apache License, Version 2.0 (the
* "License") as published by the Apache Software Foundation.
*
* You may not use this file except in compliance with the License. You may
* obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations
* under the License.
*/
import React from "react";
import { getImageUrl } from "../../../utils";

import styles from "./InputField.module.css";

type InputFieldPropTypes = {
  type: "text" | "email" | "password";
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
};

const InputField: React.FC<InputFieldPropTypes> = (props) => {

  return (
    <div className={styles.inputFieldContainer}>
      <label
        htmlFor={props.name}
        className={styles.inputLabel}
      >{props.label}:</label>
      <input
        type={props.type}
        name={props.name}
        onChange={props.handleChange}
        value={props.value}
        className={props.error ? `${styles.inputField} ${styles.inputFieldErrorState}` : styles.inputField}
        placeholder={props.placeholder}
      />
      {props.error && (
        <div className={styles.inputFieldError}>
          <img
            className={styles.inputFieldErrorIcon}
            src={getImageUrl("form-field-error-icon.png")}
            alt="Error in field"
          />
          <p className={styles.inputFieldErrorText}>{props.error}</p>
        </div>
      )}
    </div>
  );
}

export default InputField;
