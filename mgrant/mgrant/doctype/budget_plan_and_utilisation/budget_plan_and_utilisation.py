# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.budget.budget_planning import budget_validate , budget_on_update, budget_on_trash

class BudgetPlanandUtilisation(Document):
	def validate(self):
		budget_validate(self)
  
	def on_update(self):
		budget_on_update(self)

	def on_trash(self):
		budget_on_trash(self)