class mGrantTask {
    constructor(frm = null, wrapper = null) {
        // debugger
        this.frm = frm;
        this.wrapper = wrapper;
        this.task_list = [];
        this.total_pages = 1;
        this.currentPage = 1;
        if (frm) {
            this.show_task();
        }
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    getActionBar() {
        let actions = [
            {
                category: 'Set Priority',
                name: 'priority',
                actions: [
                    {
                        name: 'High',
                        color: 'red'
                    },
                    {
                        name: 'Medium',
                        color: 'yellow'
                    },
                    {
                        name: 'Low',
                        color: 'green'
                    }
                ]
            },
            {
                category: 'Set Status',
                name: 'custom_task_status',
                actions: [
                    {
                        name: 'Todo',
                        color: 'grey'
                    },
                    {
                        name: 'In Progress',
                        color: 'yellow'
                    },
                    {
                        name: 'Done',
                        color: 'green'
                    },
                    {
                        name: 'Cancelled',
                        color: 'red'
                    },
                    {
                        name: 'Delayed',
                        color: 'red'
                    }
                ]
            }
        ]
        let action_menu = document.createElement('div');
        action_menu.className = 'dropdown-menu';
        action_menu.setAttribute('aria-labelledby', 'viewDropdown')
        action_menu.style = 'padding: 12px;'
        for (let action of actions) {
            let li = document.createElement('li');
            let h6 = document.createElement('h6');
            h6.className = 'dropdown-header';
            h6.style = 'font-weight: 400; font-size: 10px; line-height: 11px; color: #0E1116;';
            h6.innerHTML = action.category;
            li.appendChild(h6);
            for (let act of action.actions) {
                let div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                    <input class="form-check-input" type="radio" name="${action.name}" id="${act.name}" value="${act.name}">
                    <span style="display: inline-block; width: 8px; height: 8px; background-color: ${act?.color}; border-radius: 50%; margin-bottom: 2px;"></span>
                    <label class="form-check-label" for="${act.name}">
                       ${act.name}
                    </label>
                `;
                li.appendChild(div);
            }
            action_menu.appendChild(li);
        }

        let el = document.createElement('div');
        el.className = 'd-flex flex-wrap pb-2 justify-content-between align-items-center';
        let main = document.createElement('div')
        main.className = 'dropdown-task-status dropdown';
        el.appendChild(main);
        main.innerHTML = ` 
                <button class="btn btn-light dropdown-toggle" type="button" id="viewBulkDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Set Status
                </button>
                ${action_menu.outerHTML} 
        `
        el.innerHTML += `
        <button id="bulkDeleteButton" class="btn mx-8" style="color: #6E7073;background-color: #FFF1E7;">
                <i class="fa fa-trash" style="color: #E03636;"></i>
            </button>
        `
        return el;
    }
    createTable() {
        let el = document.createElement('div');
        el.style = 'overflow-y:auto;'
        el.className = 'form-grid-container form-grid';
        el.innerHTML = `
            <table style="margin: 0px !important;" class="table table-bordered">
                <thead style="font-size: 12px;">
                    <tr>

                        <th class="row-check sortable-handle col" style="width: 40px; text-align: center; position: sticky; left: 0px; background-color: #F8F8F8;">
                            <input type="checkbox" id="selectAllCheckBox">
                        </th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Task Name</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Assigned To</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Task Type</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Status</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Priority</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Start Date</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Due Date</th>
                    </tr>
                </thead>
                <tbody style="background-color: #fff; font-size: 12px;">
                    ${this.task_list.length === 0 
                        ? `
                        <tr>
                            <td colspan="9" style="height:92px; text-align: center; font-size: 14px; color: #6c757d; background-color: #F8F8F8; line-height: 92px;">
                                No rows
                            </td>
                        </tr>
                        ` 
                        :this.task_list.map(task => `
                        <tr class="grid-row">
                            <td class="row-check sortable-handle col" style="width: 40px; text-align: center; position: sticky; left: 0px; background-color: #fff;">
                                <input type="checkbox" class="toggleCheckbox" data-id="${task.name}">
                            </td>
                            <td class="col grid-static-col col-xs-3 ">${task.custom_title}</td>
                            <td>
                                <div class="d-flex align-items-center" style="gap: 4px">
                                    <div  style="white-space: nowrap; width: 16px; height: 16px; background-color: ${this.getRandomColor()}; h" class="avatar  text-white rounded-circle d-flex justify-content-center align-items-center me-2" style="width: 20px; height: 20px;">${task.custom_assigned_to ? task.custom_assigned_to[0].toUpperCase() : '-'}</div>
                                    <span style="white-space: nowrap; font-weight: 400; letter-spacing: 0.25%; color: #6E7073;">
                                        ${task.custom_assigned_to ?? 'No Assignee'}
                                    </span>
                                </div>
                            </td>
                            <td style="white-space: nowrap;">${task.custom_task_type}</td>
                            <td style="padding: 5px 8px !important;">
                                <div class="dropdown"style="width: 100px; height: 26px; border-radius: 4px; background-color: #F1F1F1; color: #0E1116; font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; display: flex; align-items: center; justify-content: center; gap: 4px">
                                    <span title="status" id="dropStatus-${task.name}" class="small dropdown-toggle bg-light pointer badge ${task?.custom_task_status === 'Cancelled' ? 'text-danger' : task?.custom_task_status === 'In Progress' ? 'text-warning' : task?.custom_task_status === 'Done' ? 'text-success' : 'text-muted'}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        ${task?.custom_task_status ?? 'Status'}
                                    </span>
                                    <div class="dropdown-menu" aria-labelledby="dropStatus-${task.name}">
                                        <a class="dropdown-item task-status" data-task="${task.name}" data-status="Todo">Todo</a>
                                        <a class="dropdown-item task-status" data-task="${task.name}" data-status="In Progress">In Progress</a>
                                        <a class="dropdown-item task-status" data-task="${task.name}" data-status="Done">Done</a>
                                        <a class="dropdown-item task-status" data-task="${task.name}" data-status="Cancelled">Cancelled</a>
                                        <a class="dropdown-item task-status" data-task="${task.name}" data-status="Delayed">Delayed</a>
                                    </div>
                                </div>
                            </td>
                            <td style="padding: 5px 8px !important;">
                                <div class="dropdown" style="width: 100px; height: 26px; border-radius: 4px; background-color: #F1F1F1; color: #0E1116; font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; display: flex; align-items: center; justify-content: center; gap: 4px">
                                    <span title="Priority" id="dropPriority-${task.name}" class=" small dropdown-toggle badge bg-light pointer ${task?.priority === 'High' ? 'text-danger' : task?.priority === 'Medium' ? 'text-warning' : 'text-muted'}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                                        ${task?.priority ?? 'Low'}
                                    </span>
                                    <div class="dropdown-menu" aria-labelledby="dropPriority-${task.name}">
                                        <a class="dropdown-item task-priority" data-task="${task.name}" data-priority="Low">Low</a>
                                        <a class="dropdown-item task-priority" data-task="${task.name}" data-priority="Medium">Medium</a>
                                        <a class="dropdown-item task-priority" data-task="${task.name}" data-priority="High">High</a>
                                    </div>
                                </div>
                            </td>
                            <td style="white-space: nowrap;">${task.custom_start_date ? getFormattedDate(task.custom_start_date) : '--:--'}</td>
                            <td style="white-space: nowrap;font-size: 12px !important;" class="${(task.date && (new Date(task.date) < new Date(frappe.datetime.get_today()))) ? 'text-danger' : 'text-muted'}">${task.date ? getFormattedDate(task.date) : '--:--'}</td>
                            <td>
                                <div class="dropdown">
                                    <span title="action" class="pointer d-flex justify-content-center  align-items-center " id="dropdownMenuButton-${task.name}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        ⋮
                                    </span>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-${task.name}">
                                        <a class="dropdown-item edit-btn" data-task="${task.name}">Edit</a>
                                        <a class="dropdown-item delete-btn" data-task="${task.name}">Delete</a>
                                    </div>
                                </div>
                            </td>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        return el;
    }
    createFooter() {
        let el = document.createElement('div');
        el.className = 'd-flex flex-wrap py-2 justify-content-between';
        
        let totalPages = this.total_pages;
        let currentPage = this.currentPage;
        
        const getPagination = () => {
            if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }
    
            let pages = new Set([1, 2, totalPages - 1, totalPages]);
    
            if (currentPage > 3) pages.add(currentPage - 1);
            if (currentPage > 2) pages.add(currentPage);
            if (currentPage < totalPages - 1) pages.add(currentPage + 1);
    
            let result = [];
            let prev = 0;
            [...pages].sort((a, b) => a - b).forEach(page => {
                if (prev && page - prev > 1) {
                    result.push("...");
                }
                result.push(page);
                prev = page;
            });
    
            return result;
        };
    
        el.innerHTML = `
            <button style="height:30px;" class="btn btn-secondary btn-sm" id="createTask">
                <svg class="es-icon es-line icon-xs" aria-hidden="true">
                    <use href="#es-line-add"></use>
                </svg> Add row
            </button>
            ${totalPages > 1 ? `
                <nav aria-label="Page navigation">
                    <ul class="pagination">
                        <li class="page-item">
                            <a style="padding: 0.35rem 0.75rem !important;" class="page-link prev-page ${currentPage == 1 ? 'disabled' : ''}" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        ${getPagination().map(p => `
                            <li class="page-item ${p == currentPage ? 'active' : ''} ${p === "..." ? "disabled" : ""}">
                                <a style="padding: 0.35rem 0.75rem !important;" class="page-link">${p}</a>
                            </li>
                        `).join('')}
                        <li class="page-item">
                            <a style="padding: 0.35rem 0.75rem !important;" class="page-link next-page ${currentPage == totalPages ? 'disabled' : ''}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            ` : ''}
        `;
        
        return el;
    }
    
    noDataFound() {
        let el = document.createElement('div');
        el.style = 'flex-direction: column; height: 200px;'
        e.addClass('d-flex justify-content-center align-items-center')
        el.innerHTML = `
            <svg class="icon icon-xl" style="stroke: var(--text-light);">
                <use href="#icon-small-file"></use>
            </svg>
            <p class="text-muted">You haven't created a Recored yet</p>
        `
        return el;
    }
    async show_task() {
        let limit = 10;
        let total_records = await frappe.db.count('ToDo', {
            filters: {
                reference_type: this.frm.doc.doctype,
                reference_name: this.frm.doc.name
            }
        }
        );

        this.total_pages = Math.ceil(total_records / limit);
        this.currentPage = Math.max(1, Math.min(this.currentPage, this.total_pages));
        let start = (this.currentPage - 1) * limit;
        
        this.task_list = await frappe.db.get_list('ToDo', {
            fields: ['*'],
            filters: {
                reference_type: this.frm.doc.doctype,
                reference_name: this.frm.doc.name
            },
            order_by: 'modified desc',
            start: start,
            limit: limit,
        }); // Store reference
        let selectedIds = [];
        if (document.getElementById('task-list')) {
            document.getElementById('task-list').remove();
        }
        let task_container = document.createElement('div');
        task_container.classList.add('task-list');
        task_container.id = 'task-list';
        task_container.innerHTML = `
            <div id="task-header"></div>
            <div id="task-body"></div>
            <div id="task-footer"></div>
        `
        task_container.querySelector('#task-body').appendChild(this.createTable());
        task_container.querySelector('#task-footer').appendChild(this.createFooter());
        this.wrapper.appendChild(task_container);

        const toggleVisibility = (show) => {
            if (show) {
                // let action_bar = this.getActionBar();
                task_container.querySelector('#task-header').innerHTML = '';
                task_container.querySelector('#task-header').appendChild(this.getActionBar());

                // Bulk Update Task Status and Priority
                ['priority', 'custom_task_status'].forEach(type => {
                    document.querySelectorAll(`input[name="${type}"]`).forEach(input => {
                        input.addEventListener('click', (event) => {
                            selectedIds.length
                                ? this.updateTaskStatus(selectedIds, event.target.value, type)
                                : console.error(`No tasks selected for ${type}.`);
                        });
                    });
                });

                // bulk delete
                $('#bulkDeleteButton').on('click', function () {
                    frappe.confirm('Are you sure you want to delete the selected tasks?', async () => {
                        this.task_list = this.task_list.filter(task => !selectedIds.includes(task.name))
                        for (const taskName of selectedIds) {
                            try {
                                await frappe.db.delete_doc('ToDo', taskName);
                                await new Promise(resolve => setTimeout(resolve, 100));
                            } catch (error) {
                                console.error(`Failed to delete ${taskName}:`, error);
                            }
                        }
                        this.show_task();
                        frappe.show_alert({ message: __('Tasks deleted successfully'), indicator: 'green' });
                    });
                }.bind(this));
            } else {
                task_container.querySelector('#task-header').innerHTML = '';
            }
        };

        // Bind event for individual checkboxes
        $(document).off('change', '.toggleCheckbox').on('change', '.toggleCheckbox', function (e) {
            const id = $(e.currentTarget).data('id');
            if (e.currentTarget.checked) {
                selectedIds.push(id);
            } else {
                selectedIds = selectedIds.filter(x => x !== id);
            }
            $('#selectAllCheckBox').prop('checked', selectedIds.length === this.task_list.length);
            toggleVisibility(selectedIds.length > 0);
        }.bind(this));

        // Bind event for "Select All" checkbox
        $(document).off('change', '#selectAllCheckBox').on('change', '#selectAllCheckBox', function (e) {
            const isChecked = $(e.currentTarget).prop('checked');
            $('.toggleCheckbox').prop('checked', isChecked);
            selectedIds = isChecked ? this.task_list?.map(x => x.name) : [];
            toggleVisibility(selectedIds.length > 0);
        }.bind(this));

        // New Task
        $('#createTask').on('click', function () {
            this.form(null, 'New Task', this.frm);
        }.bind(this));
        //

        $('.delete-btn').on('click', function (e) {
            const taskName = $(e.currentTarget).data('task');
            frappe.confirm('Are you sure you want to delete this task?', () => {
                this.deleteTask(taskName);
            });
        }.bind(this));
        // Edit Task
        $('.task-status').on('click', function (e) {
            const taskName = $(e.currentTarget).data('task');
            const newStatus = $(e.currentTarget).data('status');
            console.log(newStatus, taskName)
            this.updateTaskStatus([taskName], newStatus, 'custom_task_status'); // Correct
        }.bind(this));
        // Update Task Priority
        $('.task-priority').on('click', function (e) {
            const taskName = $(e.currentTarget).data('task');
            const newPriority = $(e.currentTarget).data('priority');
            this.updateTaskStatus([taskName], newPriority, 'priority'); // Fixed `this.updateTaskStatus`
        }.bind(this));
        // New Task
        $('.edit-btn').on('click', function (e) {
            const taskName = $(e.currentTarget).data('task');
            let data = this.task_list.filter(task => task.name === taskName);
            if (data.length) {
                this.form(data[0], 'Edit Task'); // Pass valid object to `form()`
            } else {
                console.error(`Task ${taskName} not found.`);
            }
        }.bind(this));
        // pageination
        // Unbind existing event listeners before binding new ones
        $(document).off('click', '.page-link').on('click', '.page-link', (e) => {
            let page = Number($(e.target).text());
            if (!isNaN(page)) { 
                this.show_task();
                this.createFooter();
                this.currentPage = page;
            }
        });

        $(document).off('click', '.prev-page').on('click', '.prev-page', (e) => {
            if (this.currentPage > 1){
                this.show_task();
                this.createFooter();
                this.currentPage = (this.currentPage - 1)
            } 
        });

        $(document).off('click', '.next-page').on('click', '.next-page', (e) => {
            if (this.currentPage < this.total_pages){
                this.show_task();
                this.createFooter();
                this.currentPage = (this.currentPage + 1)
            } 
        });


    }

    // Update Task Status
    async updateTaskStatus(taskIds, status, key) {

        await Promise.allSettled(
            taskIds.map((taskName, index) =>
                new Promise(resolve => setTimeout(resolve, index * 200)) // Apply delay
                    .then(() => frappe.db.set_value('ToDo', taskName, key, status))
                    .then(() => {
                        this.task_list = this.task_list.map(task => {
                            if (task.name === taskName) {
                                task[key] = status;
                            }
                            return task;
                        });
                    })
                    .catch(error => console.error(`Error updating ${taskName}:`, error))
            )
        );

        this.show_task()
        frappe.show_alert({ message: __('tasks updated successfully'), indicator: 'green' });

        // if (cur_frm) cur_frm.refresh();
    }
    deleteTask = (taskName) => {
        frappe.db.delete_doc('ToDo', taskName).then(() => {
            this.show_task();
            frappe.show_alert({ message: __(`Task deleted successfully`), indicator: 'green' });
        });
    }
    async form(data = null, action, frm) {
        let label = cur_frm.active_tab_map[cur_frm.doc.name].label;
        let title = action === 'New Task' ? 'New '+label : 'Edit '+label;
        let primaryActionLabel = action === 'New Task' ? 'Save' : 'Update';

        let fileds = await frappe.call({
            method: 'frappe.desk.form.load.getdoctype',
            args: {
                doctype: 'ToDo',
                with_parent: 1,
                cached_timestamp: frappe.datetime.now_datetime()
            }
        });

        // Create the dialog form
        let fields = fileds?.docs[0]?.fields.filter((field) => !['Tab Break'].includes(field.fieldtype)).map(field => {
            if (action === 'Edit Task' && data) {
                if (data[field.fieldname]) {
                    field.default = data[field.fieldname];
                }
            }
            if (frm) {
                if (field.fieldname === 'reference_type') {
                    field.default = frm.doc.doctype;
                    field.read_only = true;
                }
                if (field.fieldname === 'reference_name') {
                    field.default = frm.doc.name;
                    field.read_only = true;
                }
            } else {
                if (field.fieldname === 'reference_type') {
                    field.read_only = true;
                }
                if (field.fieldname === 'reference_name') {
                    field.read_only = true;
                }
            }
            if (field.fieldname === 'custom_title') {
                field.reqd = 1;
            }
            if (field.fieldname === 'custom_task_type') {
                field.reqd = 1;
            }
            if (field.fieldname == 'custom_start_date') {
                field.onchange = () => {
                    if (cur_dialog?.get_value('custom_start_date') && cur_dialog.get_value('date')) {
                        if (new Date(cur_dialog?.get_value('custom_start_date')) > new Date(cur_dialog.get_value('date'))) {
                            cur_dialog.set_value('date', '')
                            frappe.throw({
                                message: "Due Date should always be greater than Start Date"
                            })
                            frappe.validated = false;
                        } else (
                            frappe.validated = true
                        )
                    }
                }
            }
            if (field.fieldname == 'date') {
                field.onchange = () => {
                    if (cur_dialog?.get_value('custom_start_date') && cur_dialog?.get_value('date')) {
                        if (new Date(cur_dialog?.get_value('custom_start_date')) > new Date(cur_dialog?.get_value('date'))) {
                            cur_dialog.set_value('date', '')
                            frappe.throw({
                                message: "Due Date should always be greater than Start Date"
                            })
                            frappe.validated = false;
                        } else (
                            frappe.validated = true
                        )
                    }
                }
            }
            if (field.fieldname === 'description') {
                field.max_height = field.max_height || '150px';
            }
            return field;
        });
        let task_form = new frappe.ui.Dialog({
            title: title,
            fields: fields,
            primary_action_label: primaryActionLabel,
            primary_action: function (values) {
                if (action === 'New Task') {
                    // Create new task logic
                    frappe.db.insert({
                        doctype: "ToDo",
                        ...values
                    }).then(async (new_doc) => {
                        if (new_doc) {
                            frappe.show_alert({ message: __('Task created successfully'), indicator: 'green' });
                            this.show_task();
                            this.createFooter();
                            this.currentPage = 1;
                            task_form.hide();
                        }
                    }).catch(error => {
                        console.error(error);
                        frappe.show_alert({ message: __('There was an error creating the task'), indicator: 'red' });
                    });
                } else if (action === 'Edit Task' && data) {
                    // Update existing task logic
                    frappe.db.set_value('ToDo', data.name, values).then(updated_doc => {
                        if (updated_doc) {
                            frappe.show_alert({ message: __('Task updated successfully'), indicator: 'green' });
                            this.task_list = this.task_list.map(task => {
                                if (task.name === data.name) {
                                    task = { ...task, ...values };
                                }
                                return task;
                            });
                            this.show_task();
                            this.createFooter();
                            this.currentPage = 1;
                            task_form.hide();
                        }
                    }).catch(error => {
                        console.error(error);
                        frappe.show_alert({ message: __('There was an error updating the task'), indicator: 'red' });
                    });
                }
            }.bind(this)

        });

        if (action === 'Edit Task' && data) {
            task_form.set_values(data);
        }
        task_form.show();
    };
}
