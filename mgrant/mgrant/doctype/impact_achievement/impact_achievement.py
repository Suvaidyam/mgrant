# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.impact.impact_achievement import impact_ach_on_update, impact_ach_on_trash

class ImpactAchievement(Document):
	def on_update(self):
		impact_ach_on_update(self)
	
	def on_trash(self):
		impact_ach_on_trash(self)
