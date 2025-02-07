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

@frappe.whitelist()
def get_versions(dt,dn):
    sql = f"""
        WITH extracted AS (
            SELECT
                ver.name AS name,
                ver.owner AS owner,
                ver.creation AS creation,
                ver.custom_actual_doctype,
                ver.custom_actual_document_name,
                ver.ref_doctype,
                jt.elem AS changed_elem,
                JSON_UNQUOTE(JSON_EXTRACT(jt.elem, '$[0]')) AS field_name,
                JSON_UNQUOTE(JSON_EXTRACT(jt.elem, '$[1]')) AS old_value,
                JSON_UNQUOTE(JSON_EXTRACT(jt.elem, '$[2]')) AS new_value
            FROM `tabVersion` AS ver,
            JSON_TABLE(JSON_EXTRACT(ver.data, '$.changed'), '$[*]' 
                COLUMNS (
                    elem JSON PATH '$'
                )
            ) jt
            WHERE ver.ref_doctype = '{dt}' AND ver.docname = '{dn}'
            LIMIT 1000
        )
        SELECT
            e.custom_actual_doctype,
            e.custom_actual_document_name,
            e.ref_doctype,
            usr.full_name AS owner,
            e.creation AS creation,
            JSON_ARRAYAGG(
                JSON_ARRAY(
                    COALESCE(tf.label, ctf.label, e.field_name),
                    COALESCE(
                        CASE 
                            WHEN e.old_value = 'null' OR e.old_value = '' THEN '(blank)' 
                            ELSE e.old_value 
                        END, 
                        ''
                    ),
                    COALESCE(
                        CASE 
                            WHEN e.new_value = 'null' OR e.new_value = '' THEN '(blank)' 
                            ELSE e.new_value 
                        END
                    , '')
                )
            ) AS changed
        FROM extracted e
        LEFT JOIN `tabDocField` AS tf ON (e.field_name = tf.fieldname AND tf.parent IN (e.ref_doctype, e.custom_actual_doctype))
        LEFT JOIN `tabCustom Field` AS ctf ON (e.field_name = ctf.fieldname AND ctf.dt IN (e.ref_doctype, e.custom_actual_doctype))
        LEFT JOIN `tabUser` AS usr ON e.owner = usr.name
        GROUP BY e.name 
        ORDER BY e.creation DESC;
    """
    return frappe.db.sql(sql,as_dict=True)
