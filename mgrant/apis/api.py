import frappe
from frappe.utils import cint

@frappe.whitelist()
def get_list_event(doctype_name,filter = None ,fields = '*'):
    return frappe.get_list(doctype_name, filters=filter, fields=fields)

@frappe.whitelist()
def get_doctype_meta(doctype):
    return frappe.get_meta(doctype)

@frappe.whitelist()
def get_meta(doctype):
    """
    Fetch metadata for a given doctype and return relevant fields.
    """
    if not frappe.has_permission(doctype, "read"):
        frappe.throw("You are not permitted to access this resource.", frappe.PermissionError)

    meta = frappe.get_meta(doctype)
    fields = [
        {
            "fieldname": field.fieldname,
            "label": field.label,
            "fieldtype": field.fieldtype,
            "default": field.default,
            "read_only": field.read_only,
            "hidden": field.hidden,
            "reqd": cint(field.reqd)
        }
        for field in meta.fields
    ]
    return {"fields": fields}

@frappe.whitelist()
def get_mgrant_note_by_id(table_id):
    # Fetch the note by its ID (assuming 'name' field is used for ID)
    note = frappe.get_all('mGrant Note', filters={'name': table_id}, fields=['name', 'title', 'description'])
    if not note:
        return _("Note not found!")
    return note[0]

# Use (Proposal)
@frappe.whitelist()
def sent_email(recipients,subject,message):
        frappe.sendmail(
            recipients=recipients,
            subject=subject,
            message=message
        )