# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from mgrant.controllers.input.input_achievement import input_ach_on_update , input_ach_on_trash

class InputAchievement(Document):
	def on_update(self):
		input_ach_on_update(self)
  
	def on_trash(self):
		input_ach_on_trash(self)