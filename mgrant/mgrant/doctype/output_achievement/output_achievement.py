# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class OutputAchievement(Document):
	def on_update(self):
		output = frappe.get_doc("Output", self.output)
		achievements = frappe.get_all("Output Achievement", filters={"Output": self.output}, fields=["achievement"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if achievement.achievement else 0
		# if Output.allocation < total_achievement:
		# 	frappe.throw("Total expense cannot be greater than allocation")
		# else:
		output.achievement = total_achievement
		output.save(ignore_permissions=True)
  
	def on_trash(self):
		output = frappe.get_doc("Output", self.output)
		achievements = frappe.get_all("Output Achievement", filters={"Output": self.output}, fields=["achievement","name"])
		total_achievement = 0
		for achievement in achievements:
			total_achievement += achievement.achievement if (achievement.achievement and achievement.name != self.name) else 0
		output.achievement = total_achievement
		output.save(ignore_permissions=True)
