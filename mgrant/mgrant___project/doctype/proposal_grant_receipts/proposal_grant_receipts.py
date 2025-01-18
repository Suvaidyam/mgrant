# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from mgrant.controllers.tranche.proposal_grant_reciept import proposal_grant_reciept_on_update, proposal_grant_reciept_on_trash

class ProposalGrantReceipts(Document):
	def on_update(self):
		proposal_grant_reciept_on_update(self)

	def on_trash(self):
		proposal_grant_reciept_on_trash(self)
