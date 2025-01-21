# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from mgrant.controllers.proposal.proposal import proposal_on_update,proposal_before_submit,proposal_on_submit

class Proposal(Document):
	def on_update(self):
		proposal_on_update(self)

	def before_submit(self):
		proposal_before_submit(self)

	def on_submit(self):
		proposal_on_submit(self)

	def before_save(self):
		user_roles = frappe.get_roles()  # Retrieves roles of the current user
		wf_name = frappe.db.get_value("Workflow", {"document_type": self.doctype, "is_active": 1}, "name")
		if wf_name:
			wf = frappe.get_doc("Workflow", wf_name)
			old_doc = self.get_doc_before_save()
			if old_doc:
				# Get old and new workflow states
				old_value = old_doc.get(wf.workflow_state_field)
				new_value = self.get("donor_stage")
				if old_value != new_value:
					valid_transition = False

					# Check transitions in the workflow
					for wt in wf.transitions:
						if wt.state == old_value:
							if wt.next_state == new_value:
								if wt.allowed in user_roles:
									valid_transition = True
								else:
									frappe.throw('Your  role does not have permission to perform this action')
								break

					# If no valid transition found, raise an error
					if not valid_transition:
						frappe.throw(
							f"Invalid transition from '{old_value}' to '{new_value}'. "
							f"Expected transition: {', '.join([t.next_state for t in wf.transitions if t.state == old_value])}"
						)