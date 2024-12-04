# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.output.output_achievement import output_ach_on_update, output_ach_on_trash

class OutputAchievement(Document):
	def on_update(self):
		output_ach_on_update(self)
	
	def on_trash(self):
		output_ach_on_trash(self)
