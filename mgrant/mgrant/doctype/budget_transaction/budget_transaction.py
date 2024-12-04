# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from mgrant.controllers.budget.budget_utilization import utilization_on_update, utilization_on_trash

class BudgetTransaction(Document):
    def on_update(self):
        utilization_on_update(self)
        
    def on_trash(self):
        utilization_on_trash(self)