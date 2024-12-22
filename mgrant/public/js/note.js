let note_list = []
async function get_note_list(frm) {
    console.log('first')
    const response = await frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'mGrant Note',
            fields: ['*'],
            filters: { 'reference_doctype': frm.doc.name },
            limit_page_length: 10000,
        },
    });
    // Assign the response message to note_list
    note_list = response.message;

    document.getElementById('notes_id').innerHTML = `
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
}

async function render_note(frm) {
    await get_note_list(frm)

    // ============= Create Note
    document.querySelectorAll('.note-button').forEach(link => {
        link.addEventListener('click', async () => {
            let { message: meta } = await frappe.call({
                method: 'mgrant.apis.api.get_doctype_meta',
                args: { doctype: 'mGrant Note' }
            });

            if (meta) {
                let dialog = new frappe.ui.Dialog({
                    title: `Create New Note`, // Corrected string interpolation
                    fields: meta.fields.map(({ fieldname, fieldtype, label, reqd, hidden, options }) => ({
                        fieldname,
                        fieldtype,
                        label,
                        reqd,
                        hidden,
                        options,
                        default: fieldname === 'note_doctype' ? frm.doc.doctype :
                            fieldname === 'reference_doctype' ? frm.doc.name : undefined
                    })),
                    primary_action_label: 'Create',
                    primary_action: () => {
                        let values = dialog.get_values();
                        if (values) {
                            frappe.call({
                                method: 'frappe.client.insert',
                                args: { doc: { doctype: 'mGrant Note', ...values } },
                                callback: () => {
                                    frappe.msgprint(__('Document Created Successfully'));
                                    dialog.hide();
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
            const noteName = this.closest('.table-list').getAttribute('data-table');

            // Fetch the latest document
            await frappe.call({
                method: 'frappe.client.get',
                args: { doctype: 'mGrant Note', name: noteName },
                callback: (res) => {
                    if (res.message) {
                        const latestNote = res.message;

                        // Open dialog to edit the note
                        let dialog = new frappe.ui.Dialog({
                            title: `Note`,
                            fields: [
                                { fieldname: 'title', label: 'Title', fieldtype: 'Data', reqd: 1, default: latestNote.title },
                                { fieldname: 'description', label: 'Description', reqd: 1, fieldtype: 'HTML Editor', default: latestNote.description }
                            ],
                            primary_action_label: 'Update',
                            primary_action: (values) => {
                                // Save the values
                                frappe.db.set_value('mGrant Note', noteName, values);
                                dialog.hide();
                            },
                            secondary_action_label: 'Cancel',
                            secondary_action: () => {
                                // Close the dialog without saving
                                dialog.hide();
                            }
                        });
                        dialog.show();
                    }
                }
            });
        });
    });



    // ======================================== Delete Note ========================================

    document.querySelectorAll('#delete_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            const doc_name = this.closest('.table-list').getAttribute('data-table');

            // Show confirmation dialog
            frappe.confirm(
                'Are you sure you want to delete this Note?', // The confirmation message
                () => { // If user clicks 'Yes'
                    frappe.db.delete_doc('mGrant Note', doc_name)
                        .then(response => {
                            frappe.throw({ message: "Document deleted successfully" });
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