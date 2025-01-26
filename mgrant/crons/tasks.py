import frappe

def mark_tasks_as_delayed():
    tasks = frappe.db.sql("""
        SELECT 
            name
        FROM 
            `tabToDo`
        WHERE 
            date < CURDATE()
            AND custom_task_status NOT IN ('Done','Cancelled','Delayed')
            AND date IS NOT NULL;
    """,as_dict=True)
    if len(tasks) > 0:
        for task in tasks:
            task_doc = frappe.get_doc('ToDo',task.name)
            task_doc.custom_task_status = 'Delayed'
            task_doc.flags.ignore_mandatory = True
            task_doc.save(ignore_permissions=True)