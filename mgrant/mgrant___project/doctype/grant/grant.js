// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

function getMonthDifference(startDate, endDate) {
    // Parse the date strings into Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
        frappe.msgprint(__("End Date should be greater than Start Date"));
        frappe.validated = false
        return false;
    }
    // Calculate the difference in months
    const yearDifference = end.getFullYear() - start.getFullYear();
    const monthDifference = end.getMonth() - start.getMonth();

    // Total months difference
    return yearDifference * 12 + monthDifference;
}

frappe.ui.form.on("Grant", {
    async refresh(frm) {
        $('.layout-side-section').remove()
        // ================================ Note ================================
        const response = await frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'mGrant Note',
                fields: ['*'],
                limit_page_length: 10000,
            },
        });

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

    </style>
    <div class="d-flex">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="d-flex mb-2 justify-content-between align-items-center" style="height:50px; line-hight:50px; border-bottom:1px solid black">
                <h4 class="pt-4">Note Titles</h4>
                <button class="note-button" id="add_note">Add Note</button>
            </div>
            <div class="title_links">
                ${response.message.map((note) => `
                    <div class="table-list" title=${note?.title} data-table=${note?.name}>
                        <div class='table_item'>
                            <div class="avatar" style="width: 24px; height: 24px; border-radius: 50%; background-color: #3f51b5; color: #fff; display: flex; justify-content: center; align-items: center;">
                                ${note?.title[0]?.toUpperCase()}
                            </div>
                            <div>${note?.title}</div>
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
            </div>
        </div>

        <!-- Main Content -->
        <div class="content" style="padding: 20px; flex-grow: 1;">
            <h4 id="default-message">Welcome! Please select a note.</h4>
            <div id="dynamic-content" style="display: none;"></div>
        </div>
    </div>
`;

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
                                title: `Edit Note: ${latestNote.title}`,
                                fields: [
                                    { fieldname: 'title', label: 'Title', fieldtype: 'Data', reqd: 1, default: latestNote.title },
                                    { fieldname: 'description', label: 'Description', reqd: 1, fieldtype: 'HTML Editor', default: latestNote.description }
                                ],
                                primary_action_label: 'Save',
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


        // ============= Create Note
        document.querySelectorAll('.note-button').forEach(link => {
            link.addEventListener('click', async () => {
                let { message: meta } = await frappe.call({
                    method: 'mgrant.apis.api.get_doctype_meta',
                    args: { doctype: 'mGrant Note' }
                });

                if (meta) {
                    let dialog = new frappe.ui.Dialog({
                        title: `Create New ${meta.name}`, // Corrected string interpolation
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


        // Attach click events for sidebar links
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
        ${response?.message.filter(note => note.name === tableId).map(note => `
                <h5>${note.title}</h5>
                <h5>${note.description}</h5>
            `).join('')}`;
        };
        // ================================ Note ================================





        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block');
    },
    states(frm) {
        setup_multiselect_dependency(frm, 'District', 'states', 'state', 'districts', 'state');
        frm.set_value({ districts: [], blocks: [], villages: [] });
    },
    districts(frm) {
        setup_multiselect_dependency(frm, 'Block', 'districts', 'district', 'blocks', 'district');
        frm.set_value({ blocks: [], villages: [] });
    },
    blocks(frm) {
        setup_multiselect_dependency(frm, 'Village', 'blocks', 'block', 'villages', 'block');
        frm.set_value({ villages: [] });
    },
    start_date(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            let start_date = frm.doc.start_date;
            let end_date = frm.doc.end_date;
            let monthDifference = getMonthDifference(start_date, end_date);
            if (monthDifference) {
                frm.set_value('grant_duration_in_months', monthDifference);
            } else {
                frm.set_value('grant_duration_in_months', 0);
            }
        }
    },
    end_date(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            let start_date = frm.doc.start_date;
            let end_date = frm.doc.end_date;
            let monthDifference = getMonthDifference(start_date, end_date);
            if (monthDifference) {
                frm.set_value('grant_duration_in_months', monthDifference);
            } else {
                frm.set_value('grant_duration_in_months', 0);
            }
        }
    },
    validate(frm) {
        if (frm.doc.start_date && frm.doc.end_date) {
            const start = new Date(frm.doc.start_date);
            const end = new Date(frm.doc.end_date);
            if (start > end) {
                frappe.throw(__("End Date should be greater than Start Date"));
                frappe.validated = false
                return false;
            }
        }
    },
});