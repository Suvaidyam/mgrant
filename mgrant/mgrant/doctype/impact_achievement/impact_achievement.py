# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ImpactAchievement(Document):
	def on_update(self):
		impact = frappe.get_doc("Impact", self.impact)
		achievements = frappe.get_all("Impact Achievement", filters={"impact": self.impact}, fields=["achievement"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if achievement.achievement else 0
		impact.achievement = total_achievement
		impact.save(ignore_permissions=True)
  
	def on_trash(self):
		impact = frappe.get_doc("Impact", self.impact)
		achievements = frappe.get_all("Impact Achievement", filters={"impact": self.impact}, fields=["achievement","name"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if (achievement.achievement and achievement.name != self.name) else 0
		impact.achievement = total_achievement
		impact.save(ignore_permissions=True)
