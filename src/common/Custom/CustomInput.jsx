import React from "react";
import { FormControl, InputLabel, FormHelperText } from "@mui/material";
import { BootstrapInput } from "../BootstrapInput";

const CustomInput = ({ label, placeholder, name, formik, readOnly = false, type = "text" }) => {
    return (

        <FormControl variant="standard" fullWidth>
            {label && (
                <InputLabel
                    shrink
                    htmlFor={name}
                    sx={{
                        fontSize: "1.3rem",
                        fontWeight: 450,
                        color: "rgba(0,0,0,0.8)",
                        '&.Mui-focused': { color: 'black' }
                    }}
                >
                    {label}
                </InputLabel>
            )}

            <BootstrapInput
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                readOnly={readOnly}
            />

            {formik.touched[name] && formik.errors[name] && (
                <FormHelperText error>{formik.errors[name]}</FormHelperText>
            )}
        </FormControl>

    );
};

export default CustomInput;
