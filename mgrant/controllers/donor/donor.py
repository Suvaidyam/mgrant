import frappe

def donor_after_insert(self):
    donor_role = frappe.db.get_single_value("mGrant Settings", "donor_admin_role")
    if not donor_role:
        return frappe.throw("Donor Admin Role not set in <a target='_blank' href='/app/mgrant-settings#defaults_tab'>mGrant Settings</a>")
    new_user = frappe.new_doc("SVA User")
    new_user.email = self.email
    new_user.role_profile = donor_role
    if len(self.donor_name.split(" ")) > 2:
        new_user.first_name = self.donor_name.split(" ")[0]
        new_user.middle_name = self.donor_name.split(" ")[1]
        new_user.last_name = self.donor_name.split(" ")[2]
    elif len(self.donor_name.split(" ")) > 1:
        new_user.first_name = self.donor_name.split(" ")[0]
        new_user.last_name = self.donor_name.split(" ")[1]
    else:
        new_user.first_name = self.donor_name
    new_user.insert(ignore_permissions=True,ignore_mandatory=True)
    if new_user:
        usr_perm = frappe.new_doc("User Permission")
        usr_perm.user = new_user.email
        usr_perm.allow = "Donor"
        usr_perm.for_value = self.name
        usr_perm.insert(ignore_permissions=True)