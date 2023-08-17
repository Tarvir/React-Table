import React, { useState, useEffect } from "react";
import "./InputFields.css";

const InputFields = () => {
  const [formFields, setFormFields] = useState([{ key: "", value: "" }]);
  const [jsonData, setJsonData] = useState("");
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    // Update JSON data whenever formFields change
    setJsonData(JSON.stringify(formFields, null, 2)); // Using null, 2 for pretty formatting
  }, [formFields]);

  const handleFormChange = (event, index) => {
    let data = [...formFields];
    data[index][event.target.name] = event.target.value;
    setFormFields(data);
  };

  const submitForm = (e) => {
    e.preventDefault();
    console.log("---json data---",jsonData)
    setShowJson(true); // Show JSON data when the Submit button is clicked
  };

  const addFields = () => {
    // Check if the last field's key and value are not empty before adding a new field
    const lastField = formFields[formFields.length - 1];
    if (lastField.key.trim() !== "" && lastField.value.trim() !== "") {
      const object = {
        key: "",
        value: "",
      };
      setFormFields([...formFields, object]);
    }
  };
  

  const removeFields = (index) => {
    let data = [...formFields];
    data.splice(index, 1);
    setFormFields(data);
  };

  return (
    <div className="App">
      <h1>MY FORM</h1>
      <form onSubmit={submitForm}>
        <button type="button" onClick={addFields}>
          Add More..
        </button>
        {formFields.map((form, index) => {
          return (
            <div key={index} className="form-field">
              <input
                name="key"
                placeholder="key"
                onChange={(event) => handleFormChange(event, index)}
                value={form.key}
              />
              <input
                name="value"
                placeholder="value"
                onChange={(event) => handleFormChange(event, index)}
                value={form.value}
              />
              <button type="button" onClick={() => removeFields(index)}>
                Remove
              </button>
            </div>
          );
        })}
        <br />
        <button type="submit">Submit</button>
      </form>

      {showJson && (
        <div className="Json-data">
          <h2>JSON Data</h2>
          <pre>{jsonData}</pre>
        </div>
      )}
    </div>
  );
};

export default InputFields;
