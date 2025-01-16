# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt
from frappe.model.document import Document
from mgrant.controllers.proposal.proposal import proposal_on_update,proposal_before_submit,proposal_on_submit

class Proposal(Document):
	def on_update(self):
		proposal_on_update(self)

	def before_submit(self):
		proposal_before_submit(self)

	def on_submit(self):
		proposal_on_submit(self)