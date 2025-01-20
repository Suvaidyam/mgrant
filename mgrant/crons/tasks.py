import frappe
from frappe.utils import nowdate
from mgrant.utils import add_business_days

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
def send_email_notifications_7_days_before():
    tasks = frappe.get_all("ToDo", 
        filters={
            "custom_task_status": ["NOT IN", ["Done","Delayed","Cancelled"]],
            "date": add_business_days(nowdate(),7)
        },
        fields=['*']
    )
    if len(tasks) > 0:
        for task in tasks:
            if task.allocated_to and task.allocated_to != "Administrator":
                frappe.sendmail(
                    recipients= [task.allocated_to],
                    subject="Task Reminder",
                    message="You have a task due 7 today. Please complete it on time."
                )           
def send_email_notifications_2_days_before():
    tasks = frappe.get_all("ToDo", 
        filters={
            "custom_task_status": ["NOT IN", ["Done","Delayed","Cancelled"]],
            "date": add_business_days(nowdate(),2)
        },
        fields=['*']
    )
    if len(tasks) > 0:
        for task in tasks:
            if task.allocated_to and task.allocated_to != "Administrator":
                frappe.sendmail(
                    recipients=[task.allocated_to],
                    subject="Task Reminder",
                    message="You have a task due 2 today. Please complete it on time."
                )        