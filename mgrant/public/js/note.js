function timeAgo(timestamp) {
    if (!timestamp) return '--:--';
    const now = Date.now();
    timestamp = new Date(timestamp);
    const diff = now - timestamp;
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    // If the timestamp is less than 1 minute ago
    if (diff < minute) {
        const seconds = Math.round(diff / second);
        return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
    }

    // If the timestamp is less than 1 hour ago
    if (diff < hour) {
        const minutes = Math.round(diff / minute);
        return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }

    // If the timestamp is less than 1 day ago
    if (diff < day) {
        const hours = Math.round(diff / hour);
        return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }

    // If the timestamp is less than 2 days ago
    if (diff < day * 2) {
        return "Yesterday";
    }

    // If the timestamp is less than 1 week ago
    if (diff < week) {
        const days = Math.round(diff / day);
        return days === 1 ? "1 day ago" : `${days} days ago`;
    }

    // If the timestamp is less than 1 month ago
    if (diff < month) {
        const weeks = Math.round(diff / week);
        return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }

    // If the timestamp is less than 1 year ago
    if (diff < year) {
        const months = Math.round(diff / month);
        return months === 1 ? "1 month ago" : `${months} months ago`;
    }

    // If the timestamp is more than 1 year ago
    const years = Math.round(diff / year);
    return years === 1 ? "1 year ago" : `${years} years ago`;
}

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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            box-sizing: border-box;
        }
        .note_content {
            width: 100%;
            padding: 20px;
        }
        .title_links {
            width: 100%;
            overflow-y: auto;
        }
        .note-button {
            background-color: black;
            color: white; 
            border: none; 
            border-radius: 8px; 
            padding: 4px 8px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }
        #default-message {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        #action_icon {
            cursor: pointer;
            background: none;
            border: none;
            font-size: 20px;
            padding: 0;
        }
        .action-menu {
            position: relative;
        }
        .action-menu-content {
            display: none;
            position: absolute;
            right: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        .action-menu-content a {
            display: block;
            padding: 5px 10px;
            text-decoration: none;
            color: inherit;
        }
        .action-menu-content a:hover {
            background: #f8fafc;
        }
        .note_message {
            display: flex;
            height: 100%;   
            justify-content: center;
            align-items: center;
        }
        .note-title {
            font-size: 24px;
            font-weight:normal ;
            margin-bottom: 20px;
        }
        .note-group {
            margin-bottom: 20px;
        }
        .group-title {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }
        .note-item {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .note-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            
        }
        .note-header h3 {
        font-weight: normal;
            font-size: 18px;
            margin: 0;
            flex-grow: 1;
            margin-right: 10px;
        }
        .form-container{
            padding: 20px;
            border: 1px solid #801621;
            border-radius: 8px;
        }
        .clearfix{
           display: none;
        }
        .note-content {
            margin-bottom: 10px;
        }
        .note-meta {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #718096;
            gap: 5px;
        }
        .add-note-link {
            color: #9C2B2E;
            text-decoration: none;
        }
        @media (max-width: 768px) {
            .note_content {
                padding: 10px;
            }
            .note-title {
                font-size: 20px;
            }
            .note-header h3 {
                font-size: 16px;
            }
            .note-item {
                padding: 10px;
            }
        }
    </style>
    <div class="d-flex">
        <!-- Main Content -->
        <div class="note_content">
            <div id="default-message">
                <div>
                    <h3>Select an item to read</h3>
                    <p>Nothing is selected</p>
                </div>
            </div>
            <div id="dynamic-content" style="display: none;"></div>
            
            <div class="title_links mt-4">
                <h2 class="note-title">My Notes</h2>
                ${groupedData.Today.length === 0 && groupedData.Yesterday.length === 0 && groupedData.Older.length === 0 ? `
                    <div class="note_message">Notes Not Found</div>
                ` : `
                    ${['Today', 'Yesterday', 'Older'].map(group =>
        groupedData[group].length > 0 ? `
                        <div class="note-group">
                            <p class="group-title">${group}</p>
                            ${groupedData[group].map(note => `
                                <div class="note-item">
                                    <div class="note-header">
                                        <h3>${note.title}</h3>
                                        <div class="action-menu">
                                            <button class="action-button" id="action_icon" note_id="${note.name}">⋮</button>
                                            <div class="action-menu-content">
                                                <a href="#" class="edit_note">Edit</a>
                                                <a href="#" class="delete_note">Delete</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="note-content">${note.description || ''}</div>
                                    <div class="note-meta">
                                        <span>${note.owner}</span>
                                        <span>•</span>
                                        <span>${timeAgo(note.creation)}</span>
                                        
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
                    // label: f.label || f.fieldname,
                    fieldname: f.fieldname,
                    fieldtype: f.fieldtype || 'Data',
                    options: f.fieldtype === 'Link' ? f.options : undefined, // Set options for Link field
                    // reqd: f.reqd || 0, // Mandatory field
                    default: f.default || '',
                    read_only: f.read_only || 0,
                    hidden: f.hidden || 0,
                    placeholder: f.placeholder || '',
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
        submitButton.classList.add('btn', 'btn-primary', 'mt-3');
        submitButton.textContent = 'Save';
        submitButton.style.float = 'right'; // Add this line to float the button to the right
        submitButton.style.marginLeft = 'auto'; // Add this line to push the button to the right
        formContainer.appendChild(submitButton);

        // Add a clearfix after the button
        const clearfix = document.createElement('div');
        clearfix.style.clear = 'both';
        formContainer.appendChild(clearfix);

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

    // ======================================== Update Note ========================================
    document.querySelectorAll('#action_icon').forEach(button => {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const dropdown = this.nextElementSibling;
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.edit_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const noteName = this.closest('.action-menu').querySelector('#action_icon').getAttribute('note_id');
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
                const fields = meta.fields
                    .filter(f => !f.hidden) // Filter out hidden fields
                    .map(f => {
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
                <div style="text-align: right;">
                    <button class="btn btn-primary mt-3" id="update-note">Update Note</button>
                </div>
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
    document.querySelectorAll('.delete_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const doc_name = this.closest('.action-menu').querySelector('#action_icon').getAttribute('note_id');

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

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.matches('#action_icon')) {
            document.querySelectorAll('.action-menu-content').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
}

async function render_note(frm, selector) {
    await get_note_list(frm, selector);
}

