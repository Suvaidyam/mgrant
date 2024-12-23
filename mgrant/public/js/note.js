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
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="d-flex mb-2 justify-content-between align-items-center" style="height:50px; line-hight:50px; border-bottom:1px solid black">
                <h4 class="pt-4">Notes</h4>
                <button class="note-button" id="add_note">Add Note</button>
            </div>
            <div class="title_links">
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

        <!-- Main Content -->
        <div class="note_content" style="padding: 20px; flex-grow: 1;">
            <div id="default-message">
                <div>
                    <h3 style="text-align:center;">Select an item to read</h3>
                    <p style="text-align:center;">Nothing is selected</p>
                </div>
            </div>
            <div id="dynamic-content" style="display: none;"></div>
        </div>
    </div>
`;
    document.querySelectorAll('.table-list').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const tableId = this.getAttribute('data-table');
            showContent(tableId);
        });
    });
    window.showContent = function (tableId) {
        const dynamicContent = document.getElementById('dynamic-content');
        const defaultMessage = document.getElementById('default-message');
        dynamicContent.style.display = 'block';
        defaultMessage.style.display = 'none';
        dynamicContent.innerHTML = `
        ${note_list?.filter(note => note.name === tableId).map(note => `
                <div class="note">
                    <p class="note-title fw-bold mt-1" style="font-weight: bold;">${note.title}</p>
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
                        f.hidden = 1;
                    }
                    if (f?.fieldname === 'related_to') {
                        f.default = frm.doc.name
                        f.read_only = 1
                        f.hidden = 1;
                    }
                    return f;
                })
                let dialog = new frappe.ui.Dialog({
                    title: `Create New Note`,
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
            const noteName = this.closest('#action_icon').getAttribute('note_id');
            if (!noteName) {
                frappe.show_alert({ message: 'Note name not found', indicator: 'red' });
                return;
            }
            try {
                const { message: latestNote } = await frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'mGrant Note', name: noteName },
                });
                if (!latestNote) {
                    frappe.show_alert({ message: 'Failed to fetch note details', indicator: 'red' });
                    return;
                }
                const { message: meta } = await frappe.call({
                    method: 'mgrant.apis.api.get_doctype_meta',
                    args: { doctype: 'mGrant Note' },
                });
                if (!meta || !meta.fields) {
                    frappe.show_alert({ message: 'Failed to fetch doctype metadata', indicator: 'red' });
                    return;
                }
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