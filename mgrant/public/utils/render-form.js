async function sva_render_form(wrapper, fields, _cb) {
    wrapper.innerHTML = ''
    console.log("I'm inside render_form")
    // Render each field using `frappe.ui.form.make_control`
        const fieldControls = [];
        fields.forEach(f => {
            if (f.hidden) return; // Skip hidden fields
            const fieldWrapper = document.createElement('div');
            fieldWrapper.classList.add('my-control', 'mb-3');
            wrapper.appendChild(fieldWrapper);
            // Create control for each field
            const control = frappe.ui.form.make_control({
                parent: fieldWrapper,
                df: {
                    label: f.label || f.fieldname,
                    fieldname: f.fieldname,
                    fieldtype: f.fieldtype || 'Data',
                    options: f.fieldtype === 'Link' ? f.options : undefined, // Set options for Link field
                    reqd: f.reqd || 0, // Mandatory field
                    default: f.default || '',
                    read_only: f.read_only || 0,
                    hidden: f.hidden || 0
                },
                render_input: true
            });
            // Ensure options are set for Dynamic Link fields
            if (f.fieldtype === 'Dynamic Link' && f.options) {
                control.df.options = f.options; // Add options for Dynamic Link field
            }
            control.refresh();
            // Explicitly set default value if defined
            if (f.default) {
                control.set_value(f.default);
            }
            fieldControls.push(control);
        });

        // Add a submit button
        const submitButton = document.createElement('button');
        submitButton.classList.add('btn', 'btn-primary', 'mt-3', 'text-right');
        submitButton.textContent = 'Save';
        wrapper.appendChild(submitButton);

        // Handle the submit action
        submitButton.addEventListener('click', async () => {
            const doc = {};

            // Collect values from controls and validate mandatory fields
            let validationFailed = false;
            fieldControls.forEach(control => {
                const value = control.get_value();
                if (control.df.reqd && !value) {
                    validationFailed = true;
                    frappe.msgprint({ message: `Field "${control.df.label}" is mandatory`, indicator: 'red' });
                }
                doc[control.df.fieldname] = value;
            });

            if (validationFailed) return; // Stop if validation fails
            _cb(doc)
        });
}