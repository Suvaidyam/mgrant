# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.outcome.outcome_achievement import outcome_ach_on_update, outcome_ach_on_trash

class OutcomeAchievement(Document):
	def on_update(self):
		outcome_ach_on_update(self)

	def on_trash(self):
		outcome_ach_on_trash(self)
