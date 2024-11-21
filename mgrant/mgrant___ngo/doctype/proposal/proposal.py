# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today


class Proposal(Document):
	def on_update(self):
		if self.stages == "Grant Letter Signed" and self.docstatus == 0:
			ngo = frappe.get_doc("NGO", self.ngo)
			project = frappe.new_doc("Project")
			project.proposal = self.name
			project.ngo = self.ngo
			project.contact = self.contact
			project.project_name = ngo.ngo_name
			if len(self.themes) > 0:
				for theme in self.themes:
					project.append("themes", {
						"theme": theme.theme
					})
			project.start_date = today()
			project.insert(ignore_permissions=True,ignore_mandatory=True)
			tranches = frappe.get_all("Tranches", filters={"proposal": self.name}, pluck="name")
			if len(tranches) > 0:
				for tranche in tranches:
					tranche_doc = frappe.get_doc("Tranches", tranche)
					tranche_doc.project = project.name
					tranche_doc.save(ignore_permissions=True)
			self.submit()
