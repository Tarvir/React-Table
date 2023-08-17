import React from "react";
import { useState,useEffect } from "react";

const TextBoxInput = (props) => {
  const [text, setText] = useState(props.defaultValue);

  const [macro_text, setMacro_text] = useState("");

  const [macro_list, setMacro_list] = useState({});

  const [emailValidationMsg, setEmailValidationMsg] = useState(false);

  let inpt_class_name = props.className + " " + props.control_type;

  const defaultHandleChange = (e) => {
    setText(checkForDoubleQuotes(e.target.value));

    // we need top remove macro text in case user remove all the text from text area

    if (macro_text.length > 0) {
      setMacro_text("");
    }

    // check if form_type in props is search then send message

    if (props.form_type === "search") {
      messageService.sendMessage("form_builder", {}, "search_auto_submit");
    }
  };

  let disabledOrNot = "";

  if (props.ff_read_only_for_edit_flag === "Y" && props.form_editable) {
    disabledOrNot = "readonly";

    inpt_class_name = inpt_class_name + " " + "readonly";
  } else {
    if (props.disabled === "disabled" || props.disabled === "readonly") {
      disabledOrNot = "readonly";

      inpt_class_name = inpt_class_name + " " + "readonly";
    }
  }

  // unsubscribe the message service before unmounting the component

  useEffect(() => {
    const subscription = messageService.onMessage().subscribe((m) => {
      if (m.senderId === "form_button_set" && m.target === "macro_json") {
        // first check if macro_json is valid jSON string or not

        if (checkIfJsonString(props.macro_json)) {
          try {
            let json_obj = JSON.parse(props.macro_json);

            let macro_code = json_obj.macro_code;

            if (Object.keys(macro_list).length > 0) {
              for (const [key, value] of Object.entries(macro_list)) {
                if (value != null && value != undefined && value != "") {
                  value.map((items) => {
                    // check if macro code matches

                    if (items.macro_code === macro_code) {
                      let process_id = items.macro_processid;

                      if (
                        process_id != null &&
                        process_id != undefined &&
                        process_id != ""
                      ) {
                        CallAPI(process_id)
                          .then((res) => {
                            if (res?.returnData.length > 0) {
                              if (
                                res?.returnData[0].p_macro_text != undefined
                              ) {
                                setMacro_text(
                                  checkForDoubleQuotes(
                                    res?.returnData[0].p_macro_text
                                  )
                                );

                                setText("");
                              }
                            }
                          })
                          .catch((err) => {
                            console.error(err);
                          });
                      } else {
                        try {
                          let mac_json = items.macro_json;

                          if (checkIfJsonString(mac_json)) {
                            let macro_json_tag = json_obj.macro_json_tag;

                            mac_json = JSON.parse(mac_json);

                            setMacro_text(
                              checkForDoubleQuotes(mac_json[macro_json_tag])
                            );

                            setText("");
                          }
                        } catch (error) {
                          console.error(error);
                        }
                      }
                    }
                  });
                }
              }
            }
          } catch (error) {
            console.log("Error", error);
          }
        }
      }

      if (m.senderId === "form_button_set" && m.target === "macro_json_field") {
        if (props.field_id === m?.text?.field_id) {
          // first check if macro_json is valid jSON string or not

          if (checkIfJsonString(props.macro_json)) {
            try {
              let json_obj = JSON.parse(props.macro_json);

              let macro_code = json_obj.macro_code;

              if (Object.keys(macro_list).length > 0) {
                for (const [key, value] of Object.entries(macro_list)) {
                  if (value != null && value != undefined && value != "") {
                    value.map((items) => {
                      // check if macro code matches

                      if (items.macro_code === macro_code) {
                        let process_id = items.macro_processid;

                        if (
                          process_id != null &&
                          process_id != undefined &&
                          process_id != ""
                        ) {
                          CallAPI(process_id)
                            .then((res) => {
                              if (res?.returnData.length > 0) {
                                if (
                                  res?.returnData[0].p_macro_text != undefined
                                ) {
                                  setMacro_text(
                                    checkForDoubleQuotes(
                                      res?.returnData[0].p_macro_text
                                    )
                                  );

                                  setText("");
                                }
                              }
                            })
                            .catch((err) => {
                              console.error(err);
                            });
                        } else {
                          try {
                            let mac_json = items.macro_json;

                            if (checkIfJsonString(mac_json)) {
                              let macro_json_tag = json_obj.macro_json_tag;

                              mac_json = JSON.parse(mac_json);

                              setMacro_text(
                                checkForDoubleQuotes(mac_json[macro_json_tag])
                              );

                              setText("");
                            }
                          } catch (error) {
                            console.error(error);
                          }
                        }
                      }
                    });
                  }
                }
              }
            } catch (error) {
              console.log("Error", error);
            }
          }
        }
      }

      if (m.senderId === "child_parent_update" && m.target === "text_box") {
        if (props.fieldIdd === m?.text?.id) {
          setText(checkForDoubleQuotes(m?.text?.value));
        }
      }

      if (m.senderId === "htmlTemplate" && m.target === "Form_builder") {
        if (props.fieldIdd === m?.text?.field_id) {
          setText("");
        }
      }

      if (
        m.senderId === "htmlTemplate" &&
        m.target === "Billing_settle_bill_amount_set"
      ) {
        if (props.fieldIdd === m?.text?.field_id) {
          setText(m?.text?.value);
        }
      }
    });

    // // return unsubscribe method to execute when component unmounts

    return () => {
      if (subscription != null && subscription != undefined) {
        subscription.unsubscribe();
      }
    };
  }, [macro_list]);

  // set macro list in use sate

  useEffect(() => {
    setMacro_list(props.macroList);
  }, [props.macroList]);

  const handleKeyPressRegex = (e) => {
    var keyCode = e.keyCode || e.which;

    if (keyCode == 13) {
      e.preventDefault();
    }

    var em = document.getElementById(props.fieldIdd).value;

    if (
      props.field_masking_class == "NA" ||
      props.field_masking_class == null
    ) {
      return true;
    } else if (props.field_masking_class !== "NA") {
      var regex = new RegExp(props.field_masking_class);

      var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);

      if (
        !regex.test(key) &&
        props.datalabel.fb_mst_fields_table.field_json_tag !== "p_email"
      ) {
        e.preventDefault();

        return false;
      }

      // else if (regex.test(em) && props.field_masking_class == "^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$") {

      //   setEmailValidationMsg(false)

      //   return true;

      // }

      // else if (!regex.test(em) && props.field_masking_class == "^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$") {

      //   setEmailValidationMsg(true)

      //   return false

      // }
    }
  };

  return (
    <div className={props.divClassName}>
      <div className={props.LabelAndInputWrapClassName}>
        <div className={props.InputFieldsLabelClassName + " spd-form-title"}>
          <>
            {props.fieldLabel}

            <span className="spd-validation-symbol">
              {props.validationSymbol}
            </span>
          </>
        </div>

        <div className={props.inputDivClass}>
          <input
            tabIndex={props.tabindex}
            type={props.type}
            onKeyPress={props.handleKeyPressRegex || handleKeyPressRegex}
            name={props.filedName}
            id={props.fieldIdd}
            className={inpt_class_name}
            defaultValue={text || macro_text}
            value={text || macro_text}
            // onKeyPress={props.onKeyPress}

            maxLength={props.maxLength}
            textmaskformat={props.textmaskformat}
            placeholder={props.placeholder}
            required={props.required}
            rows={props.rows}
            readOnly={disabledOrNot}
            ff_parent_field_id={props.ff_parent_field_id}
            ff_comp_type={props?.field_control_type}
            enablesearch={props.enableSearch}
            max={props.max}
            min={props.min}
            onChange={props.handleChangeTextBox || defaultHandleChange}
            // disabled={disabledOrNot}

            autoFocus={props.autoFocus}
            style={props.style}
            autoComplete="off"

            //

            //
          />
        </div>

        {emailValidationMsg &&
        props.datalabel.fb_mst_fields_table.field_json_tag == "p_email"
          ? "invalid email"
          : ""}
      </div>
    </div>
  );
};

export default TextBoxInput;
