# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from mgrant.controllers.tranche.proposal_grant_reciept import proposal_grant_on_validate

class ProposalGrantReceipts(Document):
	def validate(self):
		proposal_grant_on_validate(self)