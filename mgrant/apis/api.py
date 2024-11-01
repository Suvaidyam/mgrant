import frappe


@frappe.whitelist()
def get_list_event(doctype_name,filter = None ,fields = '*'):
    return frappe.get_list(doctype_name, filters=filter, fields=fields)