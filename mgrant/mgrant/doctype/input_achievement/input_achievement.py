# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class InputAchievement(Document):
	def on_update(self):
		input = frappe.get_doc("Input", self.input)
		achievements = frappe.get_all("Input Achievement", filters={"Input": self.input}, fields=["achievement"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if achievement.achievement else 0
		input.achievement = total_achievement
		input.save(ignore_permissions=True)
  
	def on_trash(self):
		input = frappe.get_doc("Input", self.input)
		achievements = frappe.get_all("Input Achievement", filters={"Input": self.input}, fields=["achievement","name"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if (achievement.achievement and achievement.name != self.name) else 0
		input.achievement = total_achievement
		input.save(ignore_permissions=True)
