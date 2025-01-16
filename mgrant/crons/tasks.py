import frappe
def mark_tasks_as_delayed():
    tasks = frappe.db.sql("""
        SELECT 
            name
        FROM 
            `tabmGrant Task`
        WHERE 
            due_date < CURDATE()
            AND status NOT IN ('Done','Cancelled','Delayed')
            AND due_date IS NOT NULL;
    """,as_dict=True)
    if len(tasks) > 0:
        for task in tasks:
            task_doc = frappe.get_doc('mGrant Task',task.name)
            task_doc.status = 'Delayed'
            task_doc.flags.ignore_mandatory = True
            task_doc.save(ignore_permissions=True)