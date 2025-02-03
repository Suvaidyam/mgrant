# Copyright (c) 2025, Suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from mgrant.controllers.financial.fund_request.hooks import validate,after_save, on_update, on_trash
class FundRequest(Document):
	def validate(self):
		validate(self)
		pass
	def after_save(self):
		after_save(self)
		pass
	def on_update(self):
		on_update(self)
		pass
	def on_trash(self):
		on_trash(self)
		pass
	def on_submit(self):
		print("Fund Request Submitted", self.name)
		pass