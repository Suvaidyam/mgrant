# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime


class BudgetTransaction(Document):
    # pass
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
    # 	budget.save(ignore_permissions=True)frappe
    def validate(self):
        date_object = datetime.strptime(self.as_on_date, "%Y-%m-%d")
        month_name = date_object.strftime("%B")
        buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
        if month_name in ("January", "February", "March"):
            buget_plan_utl_doc.q4_jan_mar_planned_budget += self.transaction
        elif month_name in ("April", "May", "June"):
            buget_plan_utl_doc.q1_apr_jun_utilisation += self.transaction
        elif month_name in ("July", "August", "September"):
            buget_plan_utl_doc.q2_jul_sep_utilisation += self.transaction
        elif month_name in ("October", "November", "December"):
            buget_plan_utl_doc.q3_oct_dec_utilisation += self.transaction
        else:
            print("Invalid month name")
        buget_plan_utl_doc.save()
        

            
        