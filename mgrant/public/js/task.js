const getTaskList = async (_f, frm) => {
    let task_form = new frappe.ui.Dialog({
        title: 'New Task',
        fields: [
            {
                label: 'Title',
                fieldname: 'title',
                fieldtype: 'Data',
                reqd: 1
            },
        ],
        primary_action_label: 'Save',
        primary_action(values) {
            frappe.call({
                method: 'mgrant.services.api.create_task',
                args: {
                    title: values.title,
                    description: frm.doc.description,
                    assigned_to: frappe.session.user,
                    due_date: frappe.datetime.nowdate(),
                    priority: 'Medium',
                    reference_doctype: 'CRM Task',
                    reference_docname: frm.doc.name
                },
                callback: function (r) {
                    if (r.message) {
                        frappe.show_alert({ message: __(`Task created successfully`), indicator: 'green' })
                        task_form.hide();
                        getTaskList(_f, frm); // Refresh the task list
                    }
                }
            });
        }
    });

    let task_list = await getDocList(_f.description, [
    ], ['*']);
    if (task_list.length == 0) {
        $('#tasks').html(
            `<div class="container">
                <div class="d-flex justify-content-end align-items-center mb-3">
                    <button class="btn btn-dark btn-sm" id="createTask">
                        <i class="bi bi-plus
                        "></i> New Task
                    </button>
                </div>
                <div class=" d-flex justify-content-center align-items-center">
                    <h4 class="">No tasks found</h4>
                </div>
            </div>`
        );
    } else {
        $('#tasks').html(
            `<div class="container">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6></h6>
                <button class="btn btn-dark btn-sm" id="createTask">
                    <i class="bi bi-plus"></i> New Task
                </button>
            </div>
            ${task_list.map(task => {
                return `
                <div class="card p-2 mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center" style="gap:8px">
                            <span class="py-1 px-2 rounded bg-light text-dark me-2">${task.title}</span>
                            <span class="text-muted medium">${task?.assigned_to ?? '--'}</span>
                            <i class="bi bi-calendar ms-2 me-1"></i>
                            <span class="text-muted small">${task?.due_date ?? '--'}</span>
                            <span class="mx-2">•</span>
                            <span class="text-muted small">${task.priority}</span>
                            <button class="btn btn-sm btn-light">
                            ${task.reference_doctype}
                            </button>
                        </div>
                        
                        <div class="d-flex" style="gap:10px">
                            <div class="d-flex align-items-center justify-content-center">
                            <p class="pointer pt-2" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-circle-o"></i>
                                    <i class="fa fa-ellipsis-h"></i>
                                </p>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item delete-btn" data-task="${task.name}">Delete</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`
        );
    }
    $('#createTask').on('click', function () {
        task_form.show();
    });

    $('.delete-btn').on('click', function (e) {
        const taskName = $(this).data('task');
        console.log('Deleting task:', taskName);
    });
};
