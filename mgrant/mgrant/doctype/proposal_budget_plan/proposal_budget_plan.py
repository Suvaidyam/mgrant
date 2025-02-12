# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from mgrant.controllers.budget.proposal_budget import proposal_budget_on_update, proposal_budget_on_trash

class ProposalBudgetPlan(Document):
	def on_update(self):
		proposal_budget_on_update(self)

	def on_trash(self):
		proposal_budget_on_trash(self)