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
    let filteredNotes = [...note_list];

    // Filter function
    window.filterNotes = function (searchTerm = '') {
        filteredNotes = note_list.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        renderNotes();
    };

    // Render notes function
    function renderNotes() {
        groupedData.Today = [];
        groupedData.Yesterday = [];
        groupedData.Older = [];
        filteredNotes.forEach(note => {
            const creationDate = formatDate(note.creation);
            if (creationDate === formatDate(today)) {
                groupedData.Today.unshift(note);
            } else if (creationDate === formatDate(yesterday)) {
                groupedData.Yesterday.push(note);
            } else {
                groupedData.Older.push(note);
            }
        });
        updateUI();
    }

    function updateUI() {
        document.querySelector(`[data-fieldname="${selector}"]`).innerHTML = `
    <style>

.section-body {
 
    padding: 0px 0px !important;
}
        .notes-container {
            display: flex;
            height: 100vh;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .notes-sidebar {
            width: 300px;
            border-right: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            background-color: #fff;
        }
        
        @media (max-width: 768px) {
            .notes-container {
                flex-direction: column;
            }
            
            .notes-sidebar {
                width: 100%;
                height: 40vh;
            }
        }
        
        .notes-header {
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notes-count {
            font-size: 0.875rem;
            font-weight: 600;
            color: #111827;
        }
        
        .header-actions-action {
            display: flex;
            gap: 1.25rem;
        }
        
        .icon-button {
            height: 2rem;
            width: 2rem;
            padding: 0.5rem;
            background: none;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            color: #374151;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .icon-button:hover {
            background-color: #f9fafb;
        }
        
        .add-button {
            background-color: #c72b1b;
            color: white;
            border: none;
        }
        
        .add-button:hover {
            background-color: #b91c1c;
        }
        
        .filter-dialog {
            display: none;
            position: absolute;
            top: 60px;
            left: 10px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            z-index: 50;
        }
        
        .filter-dialog.active {
            display: block;
        }
        
        .filter-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 0.5rem;
        }
        
        .notes-list {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
        }
        
        .time-group {
            margin-bottom: 1.5rem;
        }
        
        .time-label {
            font-size: 0.75rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }
        
        .note-item {
            padding: 0.75rem;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 0.25rem;
            transition: background-color 0.2s;
        }
        
        .note-item:hover {
            background-color: #f3f4f6;
        }
        
        .note-item.active {
            background-color: #f3f4f6;
        }
        
        .note-title {
            font-size: 0.875rem;
            color: #111827;
            margin-bottom: 0.25rem;
            font-weight: 500;
        }
        
        .note-preview {
            font-size: 0.75rem;
            color: #6b7280;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .note-meta {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }
        
        .note-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: white;
            position: relative;
        }
        
        .content-header {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .content-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            flex: 1;
        }
        
        .content-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .content-body {
            flex: 1;
            padding: 1.5rem;
            font-size: 0.875rem;
            line-height: 1.6;
            color: #374151;
            overflow-y: auto;
        }
        
        .note-timestamp {
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        
        .action-buttons {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .nav-button {
            padding: 0.5rem;
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .nav-button:not(:disabled):hover {
            color: #111827;
        }
        
        .note-counter {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0 0.5rem;
        }
        
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #6b7280;
            text-align: center;
            gap: 0.5rem;
        }
    </style>
    <div class="notes-container">
        <div class="notes-sidebar">
            <div class="notes-header">
                <div class="header-left">
                    <span class="notes-count">${filteredNotes.length} Notes</span>
                </div>
                <div class="header-actions-action">
                    <button class="icon-button" id="filter-button">
                        <i class="fa fa-filter"></i>
                    </button>
                    <button class="icon-button add-button note-button" id="add_note">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="filter-dialog" id="filter-dialog">
                <input type="text" class="filter-input" placeholder="Search notes..." id="filter-input">
            </div>
            <div class="notes-list">
                ${filteredNotes.length === 0 ? `
                    <div class="empty-state">
                        <img style="width: 60px; height: 60px;" src="/assets/mgrant/images/no-data-found.png" alt="No notes">
                        <p>No notes found</p>
                    </div>
                ` : `
                    ${['Today', 'Yesterday', 'Older'].map(group =>
            groupedData[group].length > 0 ? `
                            <div class="time-group">
                                <div class="time-label">${group}</div>
                                ${groupedData[group].map(note => `
                                    <div class="note-item table-list" data-table="${note.name}">
                                        <div class="note-title">${note.title}</div>
                                        <div class="note-preview">${note.description}</div>
                                        <div class="note-meta">1 hr ago</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''
        ).join('')}
                `}
            </div>
        </div>
        <div class="note-content">
            <div id="default-message" class="empty-state">
                <h3>Select a note to read</h3>
                <p>Choose a note from the sidebar to view its contents</p>
            </div>
            <div id="dynamic-content" style="display: none;">
                <div class="content-header">
                    <div class="content-title"></div>
                    <div class="action-buttons" id="action_icon">
                        <button class="nav-button" id="edit_note">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="nav-button" id="delete_note">
                            <i class="fa fa-trash"></i>
                        </button>
                        <span class="note-counter">1 of ${filteredNotes.length}</span>
                        <button class="nav-button" id="prev-note" disabled>
                            <i class="fa fa-chevron-left"></i>
                        </button>
                        <button class="nav-button" id="next-note" disabled>
                            <i class="fa fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="content-body">
                    <div class="note-content-text"></div>
                    <div class="note-timestamp"></div>
                </div>
            </div>
        </div>
    </div>
    `;

        // Initialize filter functionality
        const filterButton = document.getElementById('filter-button');
        const filterDialog = document.getElementById('filter-dialog');
        const filterInput = document.getElementById('filter-input');

        filterButton.addEventListener('click', () => {
            filterDialog.classList.toggle('active');
            filterInput.focus();
        });

        filterInput.addEventListener('input', (e) => {
            filterNotes(e.target.value);
        });

        // Close filter dialog when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterDialog.contains(e.target) && !filterButton.contains(e.target)) {
                filterDialog.classList.remove('active');
            }
        });

        // Add click handlers for notes
        document.querySelectorAll('.table-list').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                document.querySelectorAll('.note-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.classList.add('active');
                const tableId = this.getAttribute('data-table');
                showContent(tableId);
            });
        });
    }

    // Initial render
    renderNotes();

    window.showContent = function (tableId) {
        const dynamicContent = document.getElementById('dynamic-content');
        const defaultMessage = document.getElementById('default-message');
        const currentIndex = filteredNotes.findIndex(note => note.name === tableId);

        if (currentIndex !== -1) {
            const note = filteredNotes[currentIndex];
            dynamicContent.style.display = 'block';
            defaultMessage.style.display = 'none';

            dynamicContent.querySelector('.content-title').textContent = note.title;
            dynamicContent.querySelector('.note-content-text').innerHTML = note.description;
            // dynamicContent.querySelector('.note-timestamp').textContent = '1 hr ago';

            const actionButtons = dynamicContent.querySelector('.action-buttons');
            actionButtons.setAttribute('note_id', note.name);

            const noteCounter = dynamicContent.querySelector('.note-counter');
            noteCounter.textContent = `${currentIndex + 1} of ${filteredNotes.length}`;

            const prevButton = document.getElementById('prev-note');
            const nextButton = document.getElementById('next-note');

            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === filteredNotes.length - 1;

            prevButton.onclick = () => {
                if (currentIndex > 0) {
                    const prevNote = filteredNotes[currentIndex - 1];
                    const prevNoteElement = document.querySelector(`[data-table="${prevNote.name}"]`);
                    if (prevNoteElement) {
                        document.querySelectorAll('.note-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        prevNoteElement.classList.add('active');
                        showContent(prevNote.name);
                    }
                }
            };

            nextButton.onclick = () => {
                if (currentIndex < filteredNotes.length - 1) {
                    const nextNote = filteredNotes[currentIndex + 1];
                    const nextNoteElement = document.querySelector(`[data-table="${nextNote.name}"]`);
                    if (nextNoteElement) {
                        document.querySelectorAll('.note-item').forEach(item => {
                            item.classList.remove('active');
                        });
                        nextNoteElement.classList.add('active');
                        showContent(nextNote.name);
                    }
                }
            };
        }
    };

    // Create Note Handler
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

    // Edit Note Handler
    document.querySelectorAll('#edit_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const noteName = this.closest('.action-buttons').getAttribute('note_id');
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

    // Delete Note Handler
    document.querySelectorAll('#delete_note').forEach(link => {
        link.addEventListener('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();
            const doc_name = this.closest('.action-buttons').getAttribute('note_id');

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