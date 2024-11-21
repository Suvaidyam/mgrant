# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import today


class Proposal(Document):
	def on_update(self):
		if self.stages == "Grant Letter Signed" and self.docstatus == 0:
			project = frappe.new_doc("Project")
			project.proposal = self.name
			project.ngo = self.ngo
			project.contact = self.contact
			project.project_name = self.proposal_name
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
			outputs = frappe.get_all("Output", filters={"proposal": self.name}, pluck="name")
			if len(outputs) > 0:
				for output in outputs:
					output_doc = frappe.get_doc("Output", output)
					output_doc.project = project.name
					output_doc.save(ignore_permissions=True)
			inputs = frappe.get_all("Input", filters={"proposal": self.name}, pluck="name")
			if len(inputs) > 0:
				for input in inputs:
					input_doc = frappe.get_doc("Input", input)
					input_doc.project = project.name
					input_doc.save(ignore_permissions=True)
			outcomes = frappe.get_all("Outcome", filters={"proposal": self.name}, pluck="name")
			if len(outcomes) > 0:
				for outcome in outcomes:
					outcome_doc = frappe.get_doc("Outcome", outcome)
					outcome_doc.project = project.name
					outcome_doc.save(ignore_permissions=True)
			budgets = frappe.get_all("Budget", filters={"proposal": self.name}, pluck="name")
			if len(budgets) > 0:
				for budget in budgets:
					budget_doc = frappe.get_doc("Budget", budget)
					budget_doc.project = project.name
					budget_doc.save(ignore_permissions=True)
			impacts = frappe.get_all("Impact", filters={"proposal": self.name}, pluck="name")
			if len(impacts) > 0:
				for impact in impacts:
					impact_doc = frappe.get_doc("Impact", impact)
					impact_doc.project = project.name
					impact_doc.save(ignore_permissions=True)
			self.submit()
