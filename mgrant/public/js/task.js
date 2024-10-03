const taskList =(task_list)=>{
    const deleteTask = (taskName) => {
        frappe.db.delete_doc('CRM Task', taskName).then(() => {
            frappe.show_alert({ message: __(`Task deleted successfully`), indicator: 'green' });
            taskList(task_list.filter(task => task.name !== taskName));
        });
    }
    const updateTaskStatus = (taskName, status,key) => {
        frappe.db.set_value('CRM Task', taskName, key, status).then(() => {
            frappe.show_alert({ message: __(`Task ${key} updated successfully`), indicator: 'green' });
            const updatedTaskList = task_list.map(task => {
                if (task.name === taskName) {
                    return { ...task, [key]:status };
                }
                return task;
            });
            taskList(updatedTaskList);
        }).catch(error => {
            console.error('Error updating task status:', error);
            frappe.show_alert({ message: __('Error updating task status'), indicator: 'red' });
        });
    };
    if (task_list.length == 0) {
        $('#task-list').html(`
            <div class=" d-flex justify-content-center align-items-center">
                <h4 class="">No tasks found</h4>
            </div> `
        );
    } else {
        $('#task-list').html(
            `
            ${task_list.map(task => {
                // <i class="fa fa-circle-o"></i>
                return `
                <div class="card p-2 mb-2">
                    <div class="d-flex border-bottom mb-1 justify-content-between align-items-center w-100">
                        <span title="task title" class="py-1 px-2 text-dark me-2">${task?.title}</span>
                        <div class="d-flex align-items-center justify-content-center"  style="gap:20px">
                            <div class="d-flex" style="gap:10px"> 
                            <div class="dropdown">
                                <span title="Priority" id="dropPriority-${task.name}" class="small dropdown-toggle badge bg-light pointer ${task?.priority == 'High' ? 'text-danger' : task?.priority == 'Medium' ? 'text-warning' : 'text-muted'}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    ${task?.priority ?? 'Low'}
                                </span>
                                <div class="dropdown-menu" aria-labelledby="dropPriority-${task.name}">
                                    <a class="dropdown-item task-priority" data-task="${task.name}" data-priority="Low">Low</a>
                                    <a class="dropdown-item task-priority" data-task="${task.name}" data-priority="Medium">Medium</a>
                                    <a class="dropdown-item task-priority" data-task="${task.name}" data-priority="High">High</a> 
                                </div>
                            </div>
                            <div class="dropdown">
                                <span title="status" id="dropStatus-${task.name}" class="small dropdown-toggle bg-light pointer badge ${task?.status == 'Canceled' ? 'text-danger' : task.status == 'In Progress' ? 'text-warning' : task.status == 'Done'?'text-success': 'text-muted'}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    ${task?.status ?? 'Status'}
                                </span>
                                <div class="dropdown-menu" aria-labelledby="dropStatus-${task.name}">
                                    <a class="dropdown-item task-status" data-task="${task.name}" data-status="Backlog">Backlog</a>
                                    <a class="dropdown-item task-status" data-task="${task.name}" data-status="Todo">Todo</a>
                                    <a class="dropdown-item task-status" data-task="${task.name}" data-status="In Progress">In Progress</a>
                                    <a class="dropdown-item task-status" data-task="${task.name}" data-status="Done">Done</a>
                                    <a class="dropdown-item task-status" data-task="${task.name}" data-status="Canceled">Canceled</a>
                                </div>
                            </div>
                        </div>
                            <div class="dropdown">
                                <p title="action" class="pointer pt-2" id="dropdownMenuButton-${task.name}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fa fa-ellipsis-h"></i>
                                </p>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-${task.name}">
                                    <a class="dropdown-item delete-btn" data-task="${task.name}">Delete</a>
                                    <a class="dropdown-item edit-btn" data-task="${task.name}">Edit</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center" style="gap:8px">
                            <span class="text-muted medium">${task?.assigned_to ?? '--'}</span>
                        </div> 
                        <div>
                            <i class="bi bi-calendar ms-2 me-1"></i>
                            <span title="due date" class="text-warning small ">${task?.due_date?.split(' ')[0] ?? '--'}</span>
                        </div>
                        <span class="badge bg-light">
                            ${task.reference_doctype}
                        </span>
                    </div>
                </div>`;
            }).join('')} `
        );
    }
    $('.delete-btn').on('click', function (e) {
        const taskName = $(this).data('task');
        frappe.confirm('Are you sure you want to delete this task?', () => {
            deleteTask(taskName);
        }); 
    });
    $('.task-status').on('click', function () {
        const taskName = $(this).data('task');
        const newStatus = $(this).data('status');
        updateTaskStatus(taskName, newStatus,'status');
    });
    $('.task-priority').on('click', function () {
        const taskName = $(this).data('task');
        const newStatus = $(this).data('priority');
        updateTaskStatus(taskName, newStatus,'priority');
    });
    $('.edit-btn').on('click', function () {
        const taskName = $(this).data('task');
        let data = task_list.filter(task => task.name == taskName);
        form(data[0], 'Edit Task');
    });
    
}
let task_list = [];
const getTaskList = async (_f, frm) => {
   
    task_list = await getDocList(_f.description, [
    ], ['*']);
    $('#tasks').html(`
        <div class="d-flex justify-content-end align-items-center mb-3">
            <button class="btn btn-primary btn-sm" id="createTask">
               <svg class="es-icon es-line  icon-xs" style="" aria-hidden="true">
                    <use class="" href="#es-line-add"></use>
                </svg> New Tasks
            </button>
        </div>
        <div id="task-list"></div>`);
    taskList(task_list);
    $('#createTask').on('click', function () {
        form(null, 'New Task');
    });
};
const form = async(data = null, action) => {
    let title = action === 'New Task' ? 'New Task' : 'Edit Task';
    let primaryActionLabel = action === 'New Task' ? 'Save' : 'Update';

    let fileds = await frappe.call({
        method: 'frappe.desk.form.load.getdoctype',
        args: {
            doctype: 'CRM Task',
            with_parent: 1,
            cached_timestamp: frappe.datetime.now_datetime()
        }
    });

    // Create the dialog form
    let fields = fileds?.docs[0]?.fields.map(field => {
        if (action === 'Edit Task' && data) {
            if (data[field.fieldname]) {
                field.default = data[field.fieldname];
            }
        }
        return field;
    });
    let task_form = new frappe.ui.Dialog({
        title: title,
        fields: fields,
        primary_action_label: primaryActionLabel,
        primary_action(values) {
            if (action === 'New Task') {
                // Create new task
                frappe.db.insert({
                    doctype: 'CRM Task',
                    ...values
                }).then(new_doc => {
                    if (new_doc) {
                        console.log(new_doc);
                        frappe.show_alert({ message: __('Task created successfully'), indicator: 'green' });
                        task_form.hide();
                        taskList([new_doc, ...task_list]);
                    }
                }).catch(error => {
                    console.error(error);
                    frappe.show_alert({ message: __('There was an error creating the task'), indicator: 'red' });
                });
            } else if (action === 'Edit Task' && data) {
                // Update existing task
                frappe.db.set_value('CRM Task', data.name, values).then(updated_doc => {
                    if (updated_doc) {
                        frappe.show_alert({ message: __('Task updated successfully'), indicator: 'green' });
                        task_form.hide();
                        // Optionally update the task list with the updated document
                        let updatedTaskList = task_list.map(task => 
                            task.name === updated_doc.message.name ? updated_doc.message : task
                        );
                        taskList(updatedTaskList);
                    }
                }).catch(error => {
                    console.error(error);
                    frappe.show_alert({ message: __('There was an error updating the task'), indicator: 'red' });
                });
            }
        }
    });

    if (action === 'Edit Task' && data) {
        task_form.set_values(data);
    }
    task_form.show();

};
