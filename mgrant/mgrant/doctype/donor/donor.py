# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Donor(Document):
	def after_insert(self):
		new_user = frappe.new_doc("SVA User")
		new_user.email = self.email
		new_user.role_profile = "Donor"
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
