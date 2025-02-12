# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.tranche.fund_request import validate,after_save, on_update, on_trash 
class FundRequest(Document):
	def validate(self):
		validate(self)
		
	def after_save(self):
		after_save(self)
		
	def on_update(self):
		on_update(self)
		
	def on_trash(self):
		on_trash(self)
		
	def on_submit(self):
		print("Fund Request Submitted", self.name)
		