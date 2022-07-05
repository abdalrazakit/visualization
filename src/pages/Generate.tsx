import React from 'react';
import {InitForm} from "../helpers/InitForm";

function Generate() {
    const {
        generatingState,
        setGeneratingState,
        formData,
        setFormData,
        handleChange,
        setErrorMessages,
        renderErrorMessage
    } = InitForm();

    const doGenerate = event => {
        setGeneratingState(1);
        alert(Object.entries(formData))

        setTimeout(() => {
            setGeneratingState(2);
            setFormData({reset: true})
            setErrorMessages({ name: "name", message: "test error message" });
        }, 1000)
    }

    return (
        <div className="wrapper">
            <h1>This is the Generate</h1>
            {generatingState == 1 && <div>Generating ...</div>}
            {generatingState == 2 && <div>Generating Done</div>}

            <div>
                <fieldset>
                    <label>
                        <p>Select Type</p>
                        <select name="type" onChange={handleChange} value={formData.type || ''}>
                            <option value="Random">Random</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </label>
                </fieldset>
                <fieldset disabled={formData.type !== 'Custom'}>
                    <div className="input-container">
                        <label>Name: </label>
                        <input name="name" onChange={handleChange} value={formData.name || ''} required/>
                        {renderErrorMessage("Name")}
                    </div>

                    <div className="input-container">
                        <label>Count: </label>
                        <input type="number" name="count" onChange={handleChange} step="1"
                               value={formData.count || ''}/>
                    </div>
                    <div className="input-container">
                        <label>Gift Wrap: </label>
                        <input type="checkbox" name="gift-wrap" onChange={handleChange}
                               checked={formData['gift-wrap'] || false}/>
                    </div>
                </fieldset>
                <button type="button" onClick={doGenerate} disabled={generatingState == 1}>Generate</button>
            </div>
        </div>
    );
}

export default Generate;