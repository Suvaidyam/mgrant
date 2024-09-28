const taskList =(task_list)=>{
    const deleteTask = (taskName) => {
        frappe.db.delete_doc('CRM Task', taskName).then(() => {
            frappe.show_alert({ message: __(`Task deleted successfully`), indicator: 'green' });
            taskList(task_list.filter(task => task.name !== taskName));
        });
    }
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
                        <span class="py-1 px-2 rounded bg-light text-dark me-2">${task?.title}</span>
                        <div>
                            <i class="bi bi-calendar ms-2 me-1"></i>
                            <span class="text-warning small ">${task?.due_date ?? '--'}</span>
                            <span class="mx-2 badge bg-light ${task?.priority == 'High' ? 'text-danger' : task.priority == 'Medium' ? 'text-warning' : 'text-muted'}">•</span>
                            <span class="small ${task?.priority == 'High' ? 'text-danger' : task?.priority == 'Medium' ? 'text-warning' : 'text-muted'}">${task?.priority}</span>
                        </div>
                        <div class="d-flex align-items-center justify-content-center">
                            <p class="pointer pt-2" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fa fa-ellipsis-h"></i>
                            </p>
                            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item delete-btn" data-task="${task.name}">Delete</a>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center" style="gap:8px">
                            <span class="text-muted medium">${task?.assigned_to ?? '--'}</span>
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
    
}
const getTaskList = async (_f, frm) => {
   let fileds = await frappe.call({
        method:'frappe.desk.form.load.getdoctype',
        args: {
            doctype: 'CRM Task',
            with_parent: 1,
            cached_timestamp:frappe.datetime.now_datetime()
        },
    })
    let task_list = [];
    let task_form = new frappe.ui.Dialog({
        title: 'New Task',
        fields: fileds?.docs[0]?.fields,
        primary_action_label: 'Save',
        primary_action(values) {
            frappe.db.insert({
                doctype: 'CRM Task',
                ...values
            }).then(new_doc => {
                if (new_doc) {
                    console.log(new_doc)
                    frappe.show_alert({ message: __('Task created successfully'), indicator: 'green' });
                    task_form.hide();
                    taskList([new_doc,...task_list]);
                }
            }).catch(error => {
                console.log(error)
                frappe.show_alert({ message: __('There was an error creating the task'), indicator: 'red' });
            });
        }
        
    });

    task_list = await getDocList(_f.description, [
    ], ['*']);
    $('#tasks').html(`
        <div class="d-flex justify-content-end align-items-center mb-3">
            <button class="btn btn-dark btn-sm" id="createTask">
                <i class="bi bi-plus
                "></i> New Task
            </button>
        </div>
        <div id="task-list"></div>`);
    taskList(task_list);
    $('#createTask').on('click', function () {
        task_form.show();
    });
};