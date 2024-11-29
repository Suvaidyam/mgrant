# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class BudgetTransaction(Document):
    pass
	# def on_update(self):
	# 	budget = frappe.get_doc("Budget", self.budget)
	# 	transactions = frappe.get_all("Budget Transaction", filters={"budget": self.budget}, fields=["transaction"])
	# 	total_expense = 0
	# 	for transaction in transactions:
	# 		total_expense += transaction.transaction if transaction.transaction else 0
	# 	if budget.allocation < total_expense:
	# 		frappe.throw("Total expense cannot be greater than allocation")
	# 	else:
	# 		budget.expense = total_expense
	# 	budget.save(ignore_permissions=True)
  
	# def on_trash(self):
	# 	budget = frappe.get_doc("Budget", self.budget)
	# 	transactions = frappe.get_all("Budget Transaction", filters={"budget": self.budget}, fields=["transaction","name"])
	# 	total_expense = 0
	# 	for transaction in transactions:
	# 		total_expense += transaction.transaction if (transaction.transaction and transaction.name != self.name) else 0
	# 	budget.expense = total_expense
	# 	budget.save(ignore_permissions=True)
		
