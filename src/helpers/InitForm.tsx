import React, {useReducer, useState} from "react";

export function InitForm() {
    const [generatingState, setGeneratingState] = useState(0); // 0:nothing - 1:generating - 2:generated
    const [formData, setFormData] = useReducer((state, event) => {
        if (event.reset) {
            return {}
        }
        return {
            ...state,
            [event.name]: event.value
        }
    }, {});
    const handleChange = event => {
        const isCheckbox = event.target.type === 'checkbox';
        setFormData({
            name: event.target.name,
            value: isCheckbox ? event.target.checked : event.target.value,
        });
    }

    const [errorMessages, setErrorMessages] = useState({name: "", message: ""});
    const renderErrorMessage = (name) =>
        name === errorMessages.name && (
            <div className="error">{errorMessages.message}</div>
        );
    return {
        generatingState,
        setGeneratingState,
        formData,
        setFormData,
        handleChange,
        setErrorMessages,
        renderErrorMessage
    };
}