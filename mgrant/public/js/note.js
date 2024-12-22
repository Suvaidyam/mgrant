let note_list = []
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
    // Assign the response message to note_list
    note_list = response.message;
    document.querySelector(`[data-fieldname="${selector}"]`).innerHTML = `
    <style>
        * {
            margin: 0px;
            padding: 0px;
        }
        .sidebar {
            width: 25%;
            min-width: 380px;
            height: 80vh;
            padding: 5px;
            border-right: 1px solid #ddd;
        }
        .title_links {
            width: 100%;
            height: calc(100% - 20px);
            overflow-y: auto; 
            padding-right: 5px;
        }
        .table-list {
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
            border-radius: 20px; 
            padding: 6px 15px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }
        .note-button:hover {
            background-color: black;
            transform: scale(1.05);
        }
        #default-message{
            height:100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }  
        #action_icon{
            width:20px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            display: none !important;
        }
        .table-list:hover #action_icon{
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
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="d-flex mb-2 justify-content-between align-items-center" style="height:50px; line-hight:50px; border-bottom:1px solid black">
                <h4 class="pt-4">Note Titles</h4>
                <button class="note-button" id="add_note">Add Note</button>
            </div>
            <div class="title_links">
                ${note_list?.length == 0 ? `
                    <div class="note_message">Note Not Found</div>
                    ` : `
                    ${note_list?.map((note) => `
                    <div class="table-list" data-table=${note?.name}>
                        <div class='table_item'>
                            <div class="avatar" style="width: 24px; height: 24px; border-radius: 50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center;">
                                ${note?.title[0]?.toUpperCase()}
                            </div>
                            <div class="text-truncate" style="max-width: 300px;">${note?.title}</div>
                        </div>
                        <div id="action_icon" class="dropdown">
                            <i class="fa fa-ellipsis-v btn btn-secondary dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="font-size:16px"></i>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item" id="edit_note" edit-table=${note} href="#">Edit</a>
                                    <a class="dropdown-item" id="delete_note" href="#">Delete</a>
                                </div>
                        </div>
                    </div>
                `).join('')
        }
                    `}
            </div>
        </div>

        <!-- Main Content -->
        <div class="content" style="padding: 20px; flex-grow: 1;">
            <h4 id="default-message">Welcome! Please select a note.</h4>
            <div id="dynamic-content" style="display: none;"></div>
        </div>
    </div>
`;

    document.querySelectorAll('.table-list,#action_icon').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const tableId = this.getAttribute('data-table');
            showContent(tableId);
        });
    });


    // JavaScript function for dynamic content
    window.showContent = function (tableId) {
        const dynamicContent = document.getElementById('dynamic-content');
        const defaultMessage = document.getElementById('default-message');
        dynamicContent.style.display = 'block';
        defaultMessage.style.display = 'none';

        dynamicContent.innerHTML = `
        ${note_list?.filter(note => note.name === tableId).map(note => `
                <div class="note">
                    <p class="note-title mt-1"><span class="font-serif">Title</span> :- ${note.title}</p>
                    <p class="note-description">${note.description}</p>
                </div>
            `).join('')}`;
    };

    // ============= Create Note
    document.querySelectorAll('.note-button').forEach(link => {
        link.addEventListener('click', async () => {
            let { message: meta } = await frappe.call({
                method: 'mgrant.apis.api.get_doctype_meta',
                args: { doctype: 'mGrant Note' }
            });

            if (meta) {
                let fields = meta.fields.map((f) => {
                    if (f?.fieldname === 'reference_doctype') {
                        f.default = frm.doc.doctype
                        f.read_only = 1
                    }
                    if (f?.fieldname === 'related_to') {
                        f.default = frm.doc.name
                        f.read_only = 1
                    }
                    return f;
                })
                let dialog = new frappe.ui.Dialog({
                    title: `Create New Note`, // Corrected string interpolation
                    fields: fields,
                    primary_action_label: 'Create',
                    primary_action: () => {
                        let values = dialog.get_values();
                        if (values) {
                            frappe.call({
                                method: 'frappe.client.insert',
                                args: { doc: { doctype: 'mGrant Note', ...values } },
                                callback: async () => {
                                    await render_note(frm, selector)
                                    dialog.hide();
                                    frappe.show_alert({ message: 'Note Created Successfully', indicator: 'green' });
                                }
                            });
                        }
                    },
                    secondary_action_label: 'Cancel',
                    secondary_action: () => {
                        dialog.hide();
                    }
                });
                dialog.show();
            }
        });
    });

    // ======================================== Update Note ========================================
    document.querySelectorAll('#edit_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();

            const noteName = this.closest('.table-list').getAttribute('data-table');
            if (!noteName) {
                frappe.show_alert({ message: 'Note name not found', indicator: 'red' });
                return;
            }

            try {
                // Fetch the latest document
                const { message: latestNote } = await frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'mGrant Note', name: noteName },
                });

                if (!latestNote) {
                    frappe.show_alert({ message: 'Failed to fetch note details', indicator: 'red' });
                    return;
                }

                // Fetch the doctype meta information
                const { message: meta } = await frappe.call({
                    method: 'mgrant.apis.api.get_doctype_meta',
                    args: { doctype: 'mGrant Note' },
                });

                if (!meta || !meta.fields) {
                    frappe.show_alert({ message: 'Failed to fetch doctype metadata', indicator: 'red' });
                    return;
                }

                // Map fields with default values and conditions
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
                const dialog = new frappe.ui.Dialog({
                    title: 'Edit Note',
                    fields: fields,
                    primary_action_label: 'Update',
                    primary_action: async (values) => {
                        try {
                            await frappe.db.set_value('mGrant Note', noteName, values);
                            dialog.hide();
                            frappe.show_alert({ message: 'Note updated successfully', indicator: 'green' });
                            await render_note(frm, selector);
                        } catch (err) {
                            frappe.msgprint({ message: `Error updating note: ${err.message}`, indicator: 'red' });
                        }
                    },
                    secondary_action_label: 'Cancel',
                    secondary_action: () => dialog.hide(),
                });
                dialog.show();
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
            const doc_name = this.closest('.table-list').getAttribute('data-table');

            // Show confirmation dialog
            frappe.confirm(
                'Are you sure you want to delete this Note?', // The confirmation message
                () => { // If user clicks 'Yes'
                    frappe.db.delete_doc('mGrant Note', doc_name)
                        .then(async response => {
                            frappe.show_alert({ message: 'Note Delete successfully', indicator: 'green' });
                            await render_note(frm, selector);
                        })
                        .catch(error => {
                            console.error("Error deleting document", error);
                        });
                },
                () => { // If user clicks 'No'
                    console.log('Document deletion canceled');
                }
            );
        });
    });
}

async function render_note(frm, selector) {
    await get_note_list(frm, selector);
}