# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt
from frappe.model.document import Document
from mgrant.controllers.proposal.proposal import proposal_on_update,proposal_before_submit,proposal_on_submit,proposal_after_insert

class Proposal(Document):
	def on_update(self):
		proposal_on_update(self)

	def before_submit(self):
		proposal_before_submit(self)

	def on_submit(self):
		proposal_on_submit(self)

	def after_insert(self):
		proposal_after_insert(self)