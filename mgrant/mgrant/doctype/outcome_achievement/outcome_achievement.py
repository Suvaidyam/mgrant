# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class OutcomeAchievement(Document):
	def on_update(self):
		outcome = frappe.get_doc("Outcome", self.outcome)
		achievements = frappe.get_all("Outcome Achievement", filters={"outcome": self.outcome}, fields=["achievement"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if achievement.achievement else 0
		outcome.achievement = total_achievement
		outcome.save(ignore_permissions=True)
  
	def on_trash(self):
		outcome = frappe.get_doc("Outcome", self.outcome)
		achievements = frappe.get_all("Outcome Achievement", filters={"outcome": self.outcome}, fields=["achievement","name"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if (achievement.achievement and achievement.name != self.name) else 0
		outcome.achievement = total_achievement
		outcome.save(ignore_permissions=True)
