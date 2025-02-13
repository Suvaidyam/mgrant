# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from mgrant.controllers.donor.donor import donor_after_insert


class Donor(Document):
	def after_insert(self):
		donor_after_insert(self)