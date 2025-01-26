# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from mgrant.controllers.proposal.proposal import proposal_on_update,proposal_before_submit,proposal_on_submit,proposal_on_validate,proposal_before_save

class Proposal(Document):
	def validate(self):
		proposal_on_validate(self)
		
	def on_update(self):
		proposal_on_update(self)

	def before_submit(self):
		proposal_before_submit(self)

	def on_submit(self):
		proposal_on_submit(self)

	def before_save(self):
		proposal_before_save(self)