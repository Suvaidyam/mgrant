# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today


class Proposal(Document):
	def on_update(self):
		org = frappe.get_doc("Organisation", self.organisation)
		if self.stages == "Grant Letter Signed" and self.docstatus == 0:
			project = frappe.new_doc("Project")
			project.proposal = self.name
			project.organisation = self.organisation
			project.contact = self.contact
			project.project_name = org.name_of_the_organisation
			project.theme = self.theme
			project.start_date = today()
			project.save(ignore_permissions=True)
			self.submit()