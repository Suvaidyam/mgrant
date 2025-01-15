async function get_note_list(frm, selector) {
    const response = await frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'mGrant Note',
            fields: ['*'],
            filters: { 'reference_doctype': frm.doc.doctype, 'related_to': frm.doc.name },
            limit_page_length: 10000,
        },
    });
    note_list = response.message;
    const today = new Date(), yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formatDate = date => new Date(date).toISOString().split('T')[0];
    const groupedData = { Today: [], Yesterday: [], Older: [] };
    note_list.forEach(note => {
        const creationDate = formatDate(note.creation);
        creationDate === formatDate(today) ? groupedData.Today.unshift(note) :
            creationDate === formatDate(yesterday) ? groupedData.Yesterday.push(note) :
                groupedData.Older.push(note);
    });

    document.querySelector(`[data-fieldname="${selector}"]`).innerHTML = `
    <style>
        * {
            margin: 0px;
            padding: 0px;
        }
        .sidebar {
            width: 25%;
            height: 80vh;
            padding: 5px;
            border-right: 1px solid #ddd;
        }
        .note_content{
            width:75%;
        }
        .title_links {
            width: 100%;
            height: calc(100% - 20px);
            overflow-y: auto;
            padding-right: 5px;
        }
        .title-body{
            width:100%;
            height: 45px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            display:flex;
        }
        .table-list {
            width:95%;
            height: 45px;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            gap: 5px;
            padding-left: 8px;
            border-radius: 5px;
        }
        .table-list:hover {
            cursor: pointer;
            background-color: #f8f9fa;
        }
        .table_item{
            display: flex !important;
            gap: 5px;
            align-items: center;
        }
        .note-button {
            background-color: black;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 14px;
            cursor: pointer;
            margin-bottom:-6px;
            transition: background-color 0.3s, transform 0.2s;
        }
        #default-message{
            height:100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #action_icon{
            width:5%;
            height: 100%;
            // display: flex;
            // justify-content: center;
            // align-items: center;
            display: none;
        }
        .title-body:hover #action_icon{
            display: block !important;
        }
        #action_icon .dropdown-toggle::after {
            display: none !important;
        }
        #action_icon .fa {
            background: none !important;
            border: none !important;
            outline: none !important;
        }
        .note_message{
            display: flex;
            height:100%;
            justify-content: center;
            align-items: center;
        }
        .note-title{
            border-bottom: 1px solid black;
            padding-bottom: 10px;
        }
    </style>
    <div class="d-flex">
        <!-- Main Content -->
        <div class="note_content" style="padding: 20px; flex-grow: 1;">
            <div id="default-message">
                <div>
                    <h3 style="text-align:center;">Select an item to read</h3>
                    <p style="text-align:center;">Nothing is selected</p>
                </div>
            </div>
            <div id="dynamic-content" style="display: none;"></div>

            <div class="title_links mt-4">
                <h2>My Notes</h2>
                ${groupedData.Today.length === 0 && groupedData.Yesterday.length === 0 && groupedData.Older.length === 0 ? `
                    <div class="note_message">Notes Not Found</div>
                ` : `
                    ${['Today', 'Yesterday', 'Older'].map(group =>
        groupedData[group].length > 0 ? `
                        <div class="note-group">
                        <p class="mt-1 text-sm">${group}</p>
                        ${groupedData[group].map(note => `
                            <div class="title-body">
                            <div class="table-list" title=${note.title} data-table="${note.name}">
                                <div class="table_item">
                                <div class="avatar" style="width: 24px; height: 24px; border-radius: 50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center;">
                                    ${note.title[0]?.toUpperCase()}
                                </div>
                                <div class="text-truncate" style="max-width: 280px;">${note.title}</div>
                                </div>
                            </div>
                            <div id="action_icon" class="dropdown mt-2" note_id="${note.name}">
                                <i class="fa fa-ellipsis-v btn btn-secondary dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="font-size:20px"></i>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" id="edit_note" href="#">Edit</a>
                                <a class="dropdown-item" id="delete_note" href="#">Delete</a>
                                </div>
                            </div>
                            </div>
                        `).join('')}
                        </div>
                    ` : ''
    ).join('')}
                `}
            </div>
        </div>
    </div>
`;

    // ============= Create Note
    try {
        const { message: meta } = await frappe.call({
            method: 'mgrant.apis.api.get_doctype_meta',
            args: { doctype: 'mGrant Note' }
        });

        if (!meta || !meta.fields) {
            frappe.show_alert({ message: 'Failed to fetch metadata', indicator: 'red' });
            return;
        }
        const frm = cur_frm;
        if (!frm) {
            frappe.msgprint('Form context not found.');
            return;
        }

        // Select the container where the form should be displayed
        const dynamicContent = document.getElementById('dynamic-content');
        const defaultMessage = document.getElementById('default-message');
        dynamicContent.style.display = 'block';
        defaultMessage.style.display = 'none';
        dynamicContent.innerHTML = ''; // Clear previous content

        // Prepare the container for the form fields
        const formContainer = document.createElement('div');
        formContainer.classList.add('form-container');
        dynamicContent.appendChild(formContainer);

        // Render each field using `frappe.ui.form.make_control`
        const fieldControls = [];
        meta.fields.forEach(f => {
            if (f.hidden) return; // Skip hidden fields

            const fieldWrapper = document.createElement('div');
            fieldWrapper.classList.add('my-control', 'mb-3');
            formContainer.appendChild(fieldWrapper);

            // Set default values for specific fields
            if (f.fieldname === 'reference_doctype') {
                f.default = frm.doc.doctype;
            }
            if (f.fieldname === 'related_to') {
                f.default = frm.doc.name;
                // Explicitly set options for the Dynamic Link field
                if (f.fieldtype === "Dynamic Link") {
                    // Set options dynamically based on your requirement
                    f.options = "Your Target Doctype"; // Example: "Customer"
                }
            }

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
        formContainer.appendChild(submitButton);

        // Handle the submit action
        submitButton.addEventListener('click', async () => {
            const newNoteValues = {};

            // Collect values from controls and validate mandatory fields
            let validationFailed = false;
            fieldControls.forEach(control => {
                const value = control.get_value();
                if (control.df.reqd && !value) {
                    validationFailed = true;
                    frappe.msgprint({ message: `Field "${control.df.label}" is mandatory`, indicator: 'red' });
                }
                newNoteValues[control.df.fieldname] = value;
            });

            if (validationFailed) return; // Stop if validation fails
            newNoteValues['reference_doctype'] = frm.doc.doctype;
            newNoteValues['related_to'] = frm.doc.name;
            console.log('newNoteValues :>> ', newNoteValues);
            // Insert the new document
            try {
                const { message } = await frappe.call({
                    method: 'frappe.client.insert',
                    args: { doc: { doctype: 'mGrant Note', ...newNoteValues } }
                });

                if (message) {
                    frappe.show_alert({ message: 'Note Created Successfully', indicator: 'green' });
                    await render_note(frm, selector)
                    dynamicContent.innerHTML = ''; // Clear the form after creation
                    dynamicContent.style.display = 'none';
                    defaultMessage.style.display = 'block';
                }
            } catch (error) {
                frappe.show_alert({ message: `Error: ${error.message}`, indicator: 'red' });
            }
        });

    } catch (error) {
        frappe.msgprint({ message: `Error: ${error.message}`, indicator: 'red' });
    }
    //     });
    // });







    // ======================================== Update Note ========================================
    document.querySelectorAll('#edit_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const noteName = this.closest('#action_icon').getAttribute('note_id');
            if (!noteName) {
                frappe.show_alert({ message: 'Note name not found', indicator: 'red' });
                return;
            }

            try {
                // Fetch the note details
                const { message: latestNote } = await frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'mGrant Note', name: noteName },
                });

                if (!latestNote) {
                    frappe.show_alert({ message: 'Failed to fetch note details', indicator: 'red' });
                    return;
                }

                // Get the metadata for the doctype
                const { message: meta } = await frappe.call({
                    method: 'mgrant.apis.api.get_doctype_meta',
                    args: { doctype: 'mGrant Note' },
                });

                if (!meta || !meta.fields) {
                    frappe.show_alert({ message: 'Failed to fetch doctype metadata', indicator: 'red' });
                    return;
                }

                // Map fields and set default values based on the fetched note details
                const fields = meta.fields.map(f => {
                    if (f?.fieldname === 'reference_doctype') {
                        f.default = latestNote?.reference_doctype;
                        f.read_only = 1;
                        f.hidden = 1;
                    } else if (f?.fieldname === 'related_to') {
                        f.default = latestNote?.related_to;
                        f.read_only = 1;
                        f.hidden = 1;
                    } else if (latestNote[f.fieldname]) {
                        f.default = latestNote[f.fieldname];
                    }
                    return f;
                });

                // Function to extract plain text from HTML content
                function extractTextFromHTML(html) {
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    return div.textContent || div.innerText || '';
                }

                // Replace the dialog with inline content for editing
                const dynamicContent = document.getElementById('dynamic-content');
                const defaultMessage = document.getElementById('default-message');
                dynamicContent.style.display = 'block';
                defaultMessage.style.display = 'none';
                dynamicContent.innerHTML = `
            <div class="edit-note">
                <p class="edit-note-title fw-bold mt-1" style="font-weight: bold;">Update Note</p>
                ${fields.map(f => {
                    // Handle description field specially to show as a textarea
                    const inputType = f.fieldtype === 'Text' || f.fieldname === 'description' ? 'textarea' : 'input';

                    // Extract plain text if the field is a rich text editor
                    const fieldValue = f.fieldname === 'description' ? extractTextFromHTML(f.default || '') : (f.default || '');

                    return `
                    <div class="form-group">
                        <label for="${f.fieldname}">${f.label || f.fieldname}</label>
                        ${inputType === 'textarea' ?
                            `<textarea id="${f.fieldname}" class="form-control" ${f.read_only ? 'readonly' : ''}>${fieldValue}</textarea>` :
                            `<input type="text" id="${f.fieldname}" class="form-control" value="${fieldValue}" ${f.read_only ? 'readonly' : ''} />`
                        }
                    </div>`;
                }).join('')}
                <button class="btn btn-primary mt-3" id="update-note">Update Note</button>
            </div>
            `;

                document.getElementById('update-note').addEventListener('click', async function () {
                    const updatedValues = {};

                    // Collect key-value pairs of the fields
                    fields.forEach(f => {
                        const inputElement = document.getElementById(f.fieldname);
                        if (inputElement) {
                            const fieldValue = inputElement.tagName === 'TEXTAREA' ? inputElement.value : inputElement.value;
                            updatedValues[f.fieldname] = fieldValue;
                        }
                    });
                    // Log the updated key-value pairs
                    await frappe.db.set_value('mGrant Note', noteName, updatedValues);
                    await render_note(frm, selector)
                    frappe.show_alert({ message: 'Note updated successfully', indicator: 'green' });

                    // Optionally, you can call a method to update the data in the backend
                    // Example: frappe.call({ method: 'update_method', args: updatedValues });
                });

            } catch (err) {
                frappe.msgprint({ message: `Error: ${err.message}`, indicator: 'red' });
            }
        });
    });

    // ======================================== Delete Note ========================================
    document.querySelectorAll('#delete_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const doc_name = this.closest('#action_icon').getAttribute('note_id');

            frappe.confirm(
                'Are you sure you want to delete this Note?',
                () => {
                    frappe.db.delete_doc('mGrant Note', doc_name)
                        .then(async response => {
                            frappe.show_alert({ message: 'Note Delete successfully', indicator: 'green' });
                            await render_note(frm, selector);
                        })
                        .catch(error => {
                            console.error("Error deleting document", error);
                        });
                },
                () => {
                    console.log('Document deletion canceled');
                }
            );
        });
    });
}

async function render_note(frm, selector) {
    await get_note_list(frm, selector);
}