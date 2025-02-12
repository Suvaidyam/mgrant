const getTaskList = async (frm, selector) => {

    new mGrantTask({
        frm: frm,
        selector: selector
    }).show_task();
}

class mGrantTask {
    constructor({ frm = null, selector = null }) {
        this.frm = frm;
        this.selector = selector;
        this.task_list = [];
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    async show_task(currentPage = 1) {
        let limit = 10;
        let total_records = await frappe.db.count('ToDo', {
            filters: {
                reference_type: this.frm.doc.doctype,
                reference_name: this.frm.doc.name
            }
        }
        );

        let total_pages = Math.ceil(total_records / limit);
        currentPage = Math.max(1, Math.min(currentPage, total_pages));
        let start = (currentPage - 1) * limit;

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

        $(`[data-fieldname="${this.selector}"]`).html(`
            <div class="task-list" id="task-list">
                <div class="d-flex pb-2 flex-wrap justify-content-between align-items-center">
                    <div class="d-flex flex-wrap">
                       <!-- <p class="text-muted" style="font-weight:bold;">${this.frm.active_tab_map[this.frm.doc.name].label}</p> -->
                       <!-- Edit Button -->
                            <div class="dropdown-task-status dropdown">
                                <button class="btn btn-light dropdown-toggle" style="display:none;" type="button" id="viewBulkDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Set Status
                                </button>
                                <div class="dropdown-menu" aria-labelledby="viewDropdown" style="padding: 12px;">
                                    <li>
                                        <h6 class="dropdown-header" style="font-weight: 400; font-size: 10px; line-height: 11px; color: #0E1116;">
                                            Set Priority
                                        </h6>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="priority" id="priorityHigh" value="High">
                                            <span style="display: inline-block; width: 8px; height: 8px; background-color: red; border-radius: 50%; margin-bottom: 2px;"></span>
                                            <label class="form-check-label" for="priorityHigh">High</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="priority" id="priorityMedium" value="Medium">
                                            <span style="display: inline-block; width: 8px; height: 8px; background-color: #FA6E32; border-radius: 50%; margin-bottom: 2px;"></span>
                                            <label class="form-check-label" for="priorityMedium">Medium</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="priority" id="priorityLow" value="Low">
                                            <span style="display: inline-block; width: 8px; height: 8px; background-color: #03B151; border-radius: 50%; margin-bottom: 2px;"></span>
                                            <label class="form-check-label" for="priorityLow">Low</label>
                                        </div>
                                        <hr>
                                    </li>
                                    <li>
                                        <h6 class="dropdown-header" style="font-weight: 400; font-size: 10px; line-height: 11px; color: #0E1116;">
                                            Set Status
                                        </h6>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="custom_task_status" id="statusTodo" value="Todo">
                                            <label class="form-check-label" for="statusTodo">Todo</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="custom_task_status" id="statusInProgress" value="In Progress">
                                            <label class="form-check-label" for="statusInProgress">In Progress</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="custom_task_status" id="statusDone" value="Done">
                                            <label class="form-check-label" for="statusDone">Done</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="custom_task_status" id="statusCancelled" value="Cancelled">
                                            <label class="form-check-label" for="statusCancelled">Cancelled</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="custom_task_status" id="statusCancelled" value="Delayed">
                                            <label class="form-check-label" for="statusCancelled">Delayed</label>
                                        </div>
                                    </li>
                                </div>
                            </div>
                    </div>
                    <div class="d-flex flex-wrap" >
                        <!-- <p class="text-muted" id="total_records">Total records: ${total_records}</p> -->
                        <div class="d-flex flex-wrap " style="gap: 8px;">
                            <!-- Delete Button -->
                            <button id="bulkDeleteButton" class="btn mx-8" style="color: #6E7073; display: none;background-color: #FFF1E7;">
                            <i class="fa fa-trash" style="color: #E03636;"></i>
                            </button>
                            
                        </div>
                    </div>
                </div>
                <!-- Task List -->
               ${this.task_list.length > 0
                ? `
                <div style="overflow-y:auto;" class="form-grid-container form-grid">
                 <table style="margin: 0px !important;" class="table table-bordered">
                    <thead style="font-size: 12px;">
                        <tr>
                            
                            <th class="row-check sortable-handle col" style="width: 40px; text-align: center; position: sticky; left: 0px; background-color: #F8F8F8;">
                                <input type="checkbox" id="selectAllCheckBox">
                            </th>
                            <th class="static-area ellipsis">Task Name</th>
                            <th class="static-area ellipsis">Assigned To</th>
                            <th class="static-area ellipsis">Task Type</th>
                            <th class="static-area ellipsis">Status</th>
                            <th class="static-area ellipsis">Priority</th>
                            <th class="static-area ellipsis">Start Date</th>
                            <th class="static-area ellipsis">Due Date</th>
                        </tr>
                    </thead>
                    <tbody style="background-color: #fff; font-size: 12px;">
                        ${this.task_list.map(task => `
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
                </div>
                
                `: `
                <div style="flex-direction: column; height: 200px;" class="d-flex justify-content-center align-items-center" >
                    <svg class="icon icon-xl" style="stroke: var(--text-light);">
                        <use href="#icon-small-file"></use>
                    </svg>
                    <p class="text-muted
                    ">You haven't created a Recored yet</p>
                </div>
                `}
                <div class="d-flex flex-wrap py-2 justify-content-between">
                    <!-- New Task Button -->
                    <button style="height:30px;" class="btn btn-secondary btn-sm" id="createTask">
                    <svg class="es-icon es-line icon-xs" aria-hidden="true">
                        <use href="#es-line-add"></use>
                    </svg> Add row
                    </button>
                    <!-- Pagination -->
                   ${total_pages > 1 ? `
                     <nav aria-label="Page navigation example">
                        <ul class="pagination">
                            <li class="page-item">
                            <a class="page-link prev-page ${currentPage==1?'disabled':''}" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                                <span class="sr-only">Previous</span>
                            </a>
                            </li>
                            ${total_pages > 0 ? Array.from({ length: total_pages }, (_, i) => i + 1).map(p => `
                                <li class="page-item ${p == currentPage ? 'active' : ''}"><a class="page-link">${p}</a></li>
                            `).join('') : ''}
                            
                            <li class="page-item">
                            <a class="page-link next-page ${total_pages==currentPage?'disabled':''}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                                <span class="sr-only">Next</span>
                            </a>
                            </li>
                        </ul>
                    </nav>
                    `: ''} 
                </div>
            </div>
        `);
        const toggleVisibility = (id, show, type = 'block') => {
            console.log(id, show, type)
            document.getElementById(id).style.display = show ? type : 'none'
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
            toggleVisibility('bulkDeleteButton', selectedIds.length > 0);
            // toggleVisibility('total_records', selectedIds.length === 0, 'flex');
            toggleVisibility('viewBulkDropdown', selectedIds.length > 0);
        }.bind(this));

        // Bind event for "Select All" checkbox
        $(document).off('change', '#selectAllCheckBox').on('change', '#selectAllCheckBox', function (e) {
            const isChecked = $(e.currentTarget).prop('checked');
            $('.toggleCheckbox').prop('checked', isChecked);
            selectedIds = isChecked ? this.task_list?.map(x => x.name) : [];
            console.log(selectedIds)
            toggleVisibility('bulkDeleteButton', selectedIds.length > 0);
            // toggleVisibility('total_records', selectedIds.length === 0, 'flex');
            toggleVisibility('viewBulkDropdown', selectedIds.length > 0);
        }.bind(this));

        // Bulk Update Task Status and Priority
        ['priority', 'custom_task_status'].forEach(type => {
            document.querySelectorAll(`input[name="${type}"]`).forEach(input => {
                input.addEventListener('click', (event) => {
                    console.log(event.target.value);
                    selectedIds.length
                        ? this.updateTaskStatus(selectedIds, event.target.value, type)
                        : console.error(`No tasks selected for ${type}.`);
                });
            });
        });
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
                this.show_task(page);
            }
        });

        $(document).off('click', '.prev-page').on('click', '.prev-page', (e) => {
            if (currentPage > 1) this.show_task(currentPage - 1);
        });

        $(document).off('click', '.next-page').on('click', '.next-page', (e) => {
            if (currentPage < total_pages) this.show_task(currentPage + 1);
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
        let title = action === 'New Task' ? 'New Task' : 'Edit Task';
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
