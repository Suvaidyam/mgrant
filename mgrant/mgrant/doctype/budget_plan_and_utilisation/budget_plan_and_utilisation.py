# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class BudgetPlanandUtilisation(Document):
	def validate(self):
		self.total_planned_budget = self.q1_apr_jun_planned_budget + self.q2_jul_sep_planned_budget + self.q3_oct_dec_planned_budget + self.q4_jan_mar_planned_budget
		self.total_utilisation = self.q1_apr_jun_utilisation + self.q2_jul_sep_utilisation + self.q3_oct_dec_utilisation + self.q4_jan_mar_utilisation
		if self.total_utilisation > self.total_planned_budget:
			frappe.throw("Total Utilisation can't be greater than Total Planned Buget.")
