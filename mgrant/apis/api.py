import frappe


@frappe.whitelist()
def get_list_event(doctype_name,filter = None ,fields = '*'):
    return frappe.get_list(doctype_name, filters=filter, fields=fields)


@frappe.whitelist()
def get_project_data():
    # budgets = frappe.db.get_list('Budget', filters={'project':'Grant-0034'}, fields=['*'])
    budgets = frappe.db.get_list('Budget', filters={'project':'Grant-0034'}, fields=['name','project','custom_budget_head','budget_name','financial_year','allocation','expense'])
    for budget in budgets:
        # budget['transactions'] = frappe.db.get_list('Budget Transaction', filters={'project':'Grant-0034'}, fields=['*'])
        budget['transactions'] = frappe.db.get_list('Budget Transaction', filters={'project':'Grant-0034'}, fields=['budget','as_on_date','transaction'])
    return budgets

@frappe.whitelist()
def get_tranches():
    tranches = frappe.db.get_list('Tranches', filters={'project':'Grant-0034'}, fields=['name','project','financial_year','custom_quarter','tranch_name','amount','custom_disbursement_status','total_disbursement'])
    return tranches