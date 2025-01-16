import frappe
def mark_reports_as_delayed():
    reportings = frappe.db.sql("""
        SELECT 
            name
        FROM 
            `tabReporting`
        WHERE
            due_date < CURDATE()
            AND submission_status NOT IN ('Submitted','Delayed')
            AND due_date IS NOT NULL;
    """,as_dict=True)
    if len(reportings) > 0:
        for reporting in reportings:
            reporting_doc = frappe.get_doc('Reporting',reporting.name)
            reporting_doc.submission_status = 'Delayed'
            reporting_doc.flags.ignore_mandatory = True
            reporting_doc.save(ignore_permissions=True)