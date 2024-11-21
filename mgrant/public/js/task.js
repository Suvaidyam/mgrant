
let selectedIds = [];
function stripHtmlTags(input) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = input;
    return tempDiv.textContent || tempDiv.innerText || '';
}

const taskList = (task_list) => {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    const deleteTask = (taskName) => {
        frappe.db.delete_doc('CRM Task', taskName).then(() => {
            frappe.show_alert({ message: __(`Task deleted successfully`), indicator: 'green' });
            taskList(task_list.filter(task => task.name !== taskName));
        });
    }
    const updateTaskStatus = (taskName, status, key) => {
        frappe.db.set_value('CRM Task', taskName, key, status).then(() => {
            frappe.show_alert({ message: __(`Task ${key} updated successfully`), indicator: 'green' });
            const updatedTaskList = task_list.map(task => {
                if (task.name === taskName) {
                    return { ...task, [key]: status };
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
        $('#parent-view').html(`
            <div class=" d-flex justify-content-center align-items-center flex-wrap ">
                <h4 class="">No tasks found</h4>
            </div> `
        );
    } else {
        $('.section-body').each(function () {
            this.style.setProperty('padding', '0px', 'important');
        });
        // Card view
        $('#task-card').html(

            `
            ${task_list.map(task => {
                return `
                <style>
                    .tooltip-inner {background-color: white !important;max-width: 320px !important;}
                </style>
               <div class="col-xl-4 col-lg-6 col-md-6 col-sm-12 mb-4" >
                <div class="card border-light shadow-sm" style="padding: 16px; " >
                    <!-- Task Header -->
                            <div class="d-flex justify-content-between align-items-center"  >
                               <span title="task title"
                                    class="text-dark me-2"
                                    style="font-size: 16px; font-weight: 400; line-height: 17.6px; letter-spacing: 0.5%; color: #000;">
                                    ${task?.title}
                                </span>
                                <div class="d-flex align-items-center " style="gap: 24px; " >
                                    <div class="dropdown">
                                        <p title="action" class="pointer pt-3" id="dropdownMenuButton-${task.name}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="fa fa-ellipsis-h  mt-2" style="transform: rotate(90deg); font-size: 20px; width: 20px; height: 20px;"></i>

                                        </p>
                                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-${task.name}">
                                            <a class="dropdown-item edit-btn" data-task="${task.name}">Edit</a>
                                            <a class="dropdown-item delete-btn" data-task="${task.name}">Delete</a>
                                        </div>
                                    </div>
                                <input type="checkbox" class="toggleCheckbox form-check-input" data-id="${task.name}" style="width: 20px !important; height: 20px !important;">
                                </div>
                            </div>

                            <!-- User Info -->
                            <div class="d-flex align-items-center text-muted small " style="gap: 6px;">
                                <div class="avatar bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2" style="width: 24px; height: 24px;">A</div>
                            <span style="color: #6E7073; font-size: 12px; font-weight: 400; line-height: 13.2px;">${task.assigned_to ?? 'No assigned available'}</span>
                            </div>
                            <p data-toggle="tooltip" data-placement="bottom" title='${task.description ?? "N/A"}' data-html="true">${stripHtmlTags(task.description) ?? "No Description"}</>
                            <!-- Task Priority and Status -->
                            <div class="d-flex align-items-center justify-content-between "  style="gap: 12px;display:none !important;">
                                <div class="d-flex" style="gap: 10px;">
                                    <!-- Priority Dropdown -->
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

                                    <!-- Status Dropdown -->
                                    <div class="dropdown" style="width: 100px; height: 26px; border-radius: 4px; background-color: #F1F1F1; color: #0E1116; font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; display: flex; align-items: center; justify-content: center; gap: 4px">
                                        <span title="status" id="dropStatus-${task.name}" class="small dropdown-toggle bg-light pointer badge ${task?.status === 'Canceled' ? 'text-danger' : task?.status === 'In Progress' ? 'text-warning' : task?.status === 'Done' ? 'text-success' : 'text-muted'}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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

                                <!-- Document Type -->
                            <span class="ms-auto small" style="color: #6E7073; font-size: 12px;">
                        ${task.reference_doctype}: <span style="color: #0E1116;">${task.reference_docname ?? 'No available'}</span>
                    </span>

                            </div>

                            <!-- Due Date -->
                            <p class="small " style="color: #6E7073; padding-top: 16px;">
                                Due Date: <span class="text-danger">${task.due_date ?? '--:--'}</span>
                            </p>
                        </div>
                    </div>

               `
            }).join('')} `
        );
        // Array to store checked checkbox ids
        $(document).on('change', '.toggleCheckbox', function () {
            // Get the id of the clicked checkbox
            const checkboxId = $(this).data('id');

            if ($(this).is(':checked')) {
                selectedIds.push(checkboxId);  // Add id to the array
            } else {
                // Remove the id from the array if unchecked
                selectedIds = selectedIds.filter(id => id !== checkboxId);
            }
            if (selectedIds.length === task_list.length) {
                $('#selectAllCheckBox').prop('checked', true);
            } else {
                $('#selectAllCheckBox').prop('checked', false);
            }
            // Show or hide the delete button based on the checkbox state
            const anyChecked = selectedIds.length > 0;
            const totalTaskDiv = document.querySelector('#total-task');
            const dropdownDiv = document.querySelector('#viewBulkDropdown');
            // Initial state
            // dropdownDiv.style.display = 'none'; // Hide dropdown initially
            if (anyChecked) {
                document.getElementById('bulkDeleteButton').style.display = 'block';
                totalTaskDiv.style.display = 'none'; // Hide Total Task
                dropdownDiv.style.display = 'block';
            } else {
                document.getElementById('bulkDeleteButton').style.display = 'none';
                totalTaskDiv.style.display = 'flex'; // Show Total Task
                dropdownDiv.style.display = 'none';
            }
        });
        $('#task-list').on('change', '#selectAllCheckBox', function () {
            // hanle select all checkbox
            if ($(this).is(':checked')) {
                $('.toggleCheckbox').prop('checked', true);
                selectedIds = task_list.map(task => task.name);
                document.getElementById('bulkDeleteButton').style.display = 'block';
                document.querySelector('#total-task').style.display = 'none';
                document.querySelector('#viewBulkDropdown').style.display = 'block';
            } else {
                $('.toggleCheckbox').prop('checked', false);
                selectedIds = [];
                document.getElementById('bulkDeleteButton').style.display = 'none';
                document.querySelector('#total-task').style.display = 'block';
                document.querySelector('#viewBulkDropdown').style.display = 'none';
            }
        });
        document.addEventListener('DOMContentLoaded', () => {
            const toggleCheckbox = document.querySelector('.toggleCheckbox');
            const totalTaskDiv = document.querySelector('#total-task');
            const dropdownDiv = document.querySelector('#viewBulkDropdown');

            toggleCheckbox.addEventListener('change', () => {
                if (toggleCheckbox.checked) {
                    totalTaskDiv.style.display = 'none'; // Hide Total Task
                    dropdownDiv.style.display = 'block'; // Show dropdown
                } else {
                    totalTaskDiv.style.display = 'flex'; // Show Total Task
                    dropdownDiv.style.display = 'none'; // Hide dropdown
                }
            });
        });
        document.querySelectorAll('input[name="priority"]').forEach(input => {
            input.addEventListener('click', function () {
                if (selectedIds.length > 0) {
                    for (id of selectedIds) {
                        console.log(`Priority selected: ${this.value}, for Task ID: ${id}`);
                        updateTaskStatus(id, this.value, 'priority');
                    }
                } else {
                    console.error('Task ID (data-id) is missing for the priority input.');
                }
            });
        });

        // Add event listeners for status radio buttons
        document.querySelectorAll('input[name="status"]').forEach(input => {
            input.addEventListener('click', function () {
                if (selectedIds.length > 0) {
                    for (id of selectedIds) {
                        console.log(`Status selected: ${this.value}, for Task ID: ${id}`);
                        updateTaskStatus(id, this.value, 'status');
                    }
                } else {
                    console.error('Task ID (data-id) is missing for the status input.');
                }
            });
        });
        // List view
        $('#task-list').html(
            `
<div class="table-responsive">
    <table class="table table-bordered">
      <thead class="thead-light" >
            <tr style="height: 32px !important;">
                <th ><input type="checkbox" id="selectAllCheckBox" style="width: 20px !important; height: 20px !important; "></th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073; ">Task Name</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Assigned To</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Task Type</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Status</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Priority</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Start Date</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Due Date</th>
                <th style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Doc Type</th>
                <th class="text-center align-middle" style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">Action</th>
            </tr>
        </thead>

        <tbody>
            ${task_list.map(task => {
                return `
<tr style="height: 32px !important;">
    <td><input type="checkbox" class="toggleCheckbox" data-id="${task.name}" style="width: 20px !important; height: 20px !important; text-align: center !important;" ></td>
    <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;  ">${task.title}</td>
    <td>
        <div class="d-flex align-items-center" style="gap: 4px">
            <div class="avatar bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2" style="width: 20px; height: 20px;">A</div>
            <span style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">
                ${task.assigned_to ?? 'No assigned available'}
            </span>
        </div>
    </td>
    <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">${task.reference_docname ?? 'Not available'} </td>
    <td>
          <div class="dropdown"style="width: 100px; height: 26px; border-radius: 4px; background-color: #F1F1F1; color: #0E1116; font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; display: flex; align-items: center; justify-content: center; gap: 4px">
                    <span title="status" id="dropStatus-${task.name}" class="small dropdown-toggle bg-light pointer badge ${task?.status === 'Canceled' ? 'text-danger' : task?.status === 'In Progress' ? 'text-warning' : task?.status === 'Done' ? 'text-success' : 'text-muted'}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
    </td>
    <td>
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
    <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">${task.start_date ?? '--:--'}</td>
    <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #FA4032;">${task.due_date ?? '--:--'}</td>
    <td style="font-weight: 400; font-size: 14px; line-height: 15.4px; letter-spacing: 0.25%; color: #6E7073;">  ${task.reference_doctype ?? 'NO available'}   </td>
    <td class="">                                                                                                       
      <div class="dropdown">
            <p title="action" class="pointer " id="dropdownMenuButton-${task.name}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fa fa-ellipsis-h " style="transform: rotate(90deg); font-size: 20px; width: 20px; height: 20px;"></i>

            </p>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton-${task.name}">
                <a class="dropdown-item edit-btn" data-task="${task.name}">Edit</a>
                <a class="dropdown-item delete-btn" data-task="${task.name}">Delete</a>
            </div>
        </div>
    </td>
</tr>
                `;
            }).join('')}
        </tbody>
    </table>
</div>

              `
        );

        $('#bulkDeleteButton').on('click', function () {
            frappe.confirm('Are you sure you want to delete the selected tasks?', () => {
                selectedIds.forEach(async taskName => {
                    await frappe.db.delete_doc('CRM Task', taskName)
                });
                taskList(task_list.filter(task => !selectedIds.includes(task.name)));
                frappe.show_alert({ message: __(`Tasks deleted successfully`), indicator: 'green' });
            });
        });

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
        updateTaskStatus(taskName, newStatus, 'status');
    });
    $('.task-priority').on('click', function () {
        const taskName = $(this).data('task');
        const newStatus = $(this).data('priority');
        updateTaskStatus(taskName, newStatus, 'priority');
    });
    $('.edit-btn').on('click', function () {
        const taskName = $(this).data('task');
        let data = task_list.filter(task => task.name == taskName);
        form(data[0], 'Edit Task');
    });
}
let task_list = [];
let view = 'Card View'

const getTaskList = async (_f, frm) => {
    task_list = await getDocList(_f.description, [
        ['CRM Task', 'reference_doctype', '=', frm.doc.doctype],
        ['CRM Task', 'reference_docname', '=', frm.doc.name],
    ], ['*']);
    $('#tasks').html(`
       <div class="d-flex flex-wrap justify-content-between align-items-center mb-3" style=".scrollable-buttons {
        overflow-x: auto;
        white-space: nowrap;
    }
    .scrollable-buttons .btn {
        display: inline-block;
    }">
       
         <div id="total-task" style="gap: 16px; display: flex;">
            <span class="text-dark" style="font-weight: 400; font-size: 14px; line-height: 15px; color: #6E7073;">
                Total Task:
            </span>
            <span style="font-weight: 400; font-size: 14px; line-height: 15px; color: #0E1116;">
                ${task_list.length}
            </span>
        </div>

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
                <input class="form-check-input" type="radio" name="status" id="statusTodo" value="ToDo">
                <label class="form-check-label" for="statusTodo">To Do</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="status" id="statusBacklog" value="Backlog">
                <label class="form-check-label" for="statusBacklog">Backlog</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="status" id="statusInProgress" value="InProgress">
                <label class="form-check-label" for="statusInProgress">In Progress</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="status" id="statusDone" value="Done">
                <label class="form-check-label" for="statusDone">Done</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="status" id="statusCancelled" value="Cancelled">
                <label class="form-check-label" for="statusCancelled">Cancelled</label>
            </div>
        </li>
    </div>
</div>
    <!-- Action Buttons Group -->
        <div class="d-flex flex-wrap mt-2 mt-md-0" style="gap: 16px">
        <!-- Delete Button -->
 <button id="bulkDeleteButton" class="btn btn-light mx-8" style="color: #6E7073; display: none;">
    <i class="fa fa-trash" style="color: #6E7073;"></i>
</button>
        <!-- Card View Button -->
       <div class="dropdown">
   <button class="btn btn-light" type="button" id="viewDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    <i class="fa fa-th-large" style="color: #6E7073;"></i> ${view}
    <i class="fa fa-sort" style="color: #6E7073;"></i>
  </button>

    <div class="dropdown-menu" aria-labelledby="viewDropdown">
        <span class="dropdown-item" id="cardViewBtn">
            <i class="fa fa-th-large"></i> Card View
        </span>
        <span class="dropdown-item" id="listViewBtn">
            <i class="fa fa-list"></i> List View
        </span>
    </div>
</div>
        <!-- Filters Button -->
       <button class="btn btn-light d-flex align-items-center filter-btn">
    <!-- Filter Icon -->
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6E7073" class="bi bi-filter" viewBox="0 0 16 16">
        <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
    </svg>
    <!-- Label -->
    <span class="mx-2" style="color: #6E7073;">Filters</span>
    <!-- Vertical Line Separator -->
   <div style="height: 20px; width: 1px; background-color: #6E7073; margin: 0 8px;"></div>
    <!-- Close Icon -->
    <span aria-hidden="true" style="font-size: 16px; line-height: 16px; display: inline-block; width: 16px; height: 16px; color: #6E7073;">&times;</span>
    </button>
        <!-- New Task Button -->
        <button class="btn btn-primary btn-sm" id="createTask">
            <svg class="es-icon es-line icon-xs" aria-hidden="true">
                <use href="#es-line-add"></use>
            </svg> New Tasks
        </button>
    </div>
</div>
<div id="parent-view">
    ${view === 'Card View' ? `<div id="task-card" class="row"></div>` : `<div id="task-list" class=""></div>`}
</div>
       
        `);
    taskList(task_list);
    $('#createTask').on('click', function () {
        form(null, 'New Task', frm);
    });
    $('#cardViewBtn').on('click', () => {
        view = 'Card View';
        getTaskList(_f, frm);

    })
    $('#listViewBtn').on('click', () => {
        view = 'List View';
        getTaskList(_f, frm);

    })
};
const form = async (data = null, action, frm) => {
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
        if (frm) {
            if (field.fieldname === 'reference_doctype') {
                field.default = frm.doc.doctype;
                field.read_only = true;
            }
            if (field.fieldname === 'reference_docname') {
                field.default = frm.doc.name;
                field.read_only = true;
            }
        } else {
            if (field.fieldname === 'reference_doctype') {
                field.read_only = true;
            }
            if (field.fieldname === 'reference_docname') {
                field.read_only = true;
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
                    doctype: "CRM Task",
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
