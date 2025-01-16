import frappe
@frappe.whitelist()
def mark_tranches_as_delayed():
    tranches = frappe.db.sql("""
        SELECT 
            name
        FROM 
            `tabGrant Receipts`
        WHERE 
            planned_due_date < CURDATE()
            AND fund_receipt_status IN ('Due', '')
            AND planned_due_date IS NOT NULL;
    """,as_dict=True)
    if len(tranches) > 0:
        for tranche in tranches:
            tranche_doc = frappe.get_doc('Grant Receipts',tranche.name)
            tranche_doc.fund_receipt_status = 'Due - Delayed'
            tranche_doc.flags.ignore_mandatory = True
            tranche_doc.save(ignore_permissions=True)