import frappe

def grant_after_insert(self):
    mgrant_settings = frappe.get_doc("mGrant Settings")
    mgsgw = frappe.new_doc("mGrant Settings Grant Wise")
    if mgrant_settings:
        mgsgw.update(mgrant_settings.as_dict())
        mgsgw.grant_name = self.name
    else:
        mgsgw.grant_name = self.name
    mgsgw.insert(ignore_permissions=True)
    
    # Setup Parent For Sub Granting
    if self.implementation_type == "Sub Grant":
        parent_grant = frappe.get_doc("Grant", self.parent_grant)
        parent_grant.subgranting_status = "Sub-granting Active"
        parent_grant.flags.ignore_mandatory = True
        parent_grant.save(ignore_permissions=True)