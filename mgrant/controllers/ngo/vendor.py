import frappe

@frappe.whitelist()
def vendor_status_cron(self):
    grant = frappe.db.get_list('Grant',
        filters={
            'vendor': self.name
        },
        page_length=1,
        fields=['name'],
    )
    if len(grant) > 0:
        self.vendor_status = "Vendor"
    elif not grant:
        self.vendor_status = "Prospect"
    if self.is_blacklisted == True:
        self.vendor_status = "Blacklisted"
    elif self.is_blacklisted == False and len(grant) > 0:
        self.vendor_status = "Vendor"
    elif self.is_blacklisted == False and not len(grant) > 0:
        self.vendor_status = "Prospect"

def vendor_after_insert(self):
    new_user = frappe.new_doc("SVA User")
    new_user.email = self.email
    new_user.role_profile = "Partner NGO"
    if len(self.vendor_name.split(" ")) > 2:
        new_user.first_name = self.vendor_name.split(" ")[0]
        new_user.middle_name = self.vendor_name.split(" ")[1]
        new_user.last_name = self.vendor_name.split(" ")[2]
    elif len(self.vendor_name.split(" ")) > 1:
        new_user.first_name = self.vendor_name.split(" ")[0]
        new_user.last_name = self.vendor_name.split(" ")[1]
    else:
        new_user.first_name = self.vendor_name
    new_user.insert(ignore_permissions=True,ignore_mandatory=True)
    if new_user:
        usr_perm = frappe.new_doc("User Permission")
        usr_perm.user = new_user.email
        usr_perm.allow = "Vendor"
        usr_perm.for_value = self.name
        usr_perm.insert(ignore_permissions=True)

def vendor_before_save(self):
    if not self.is_new():
        vendor_status_cron(self)