import frappe

def budget_validate(self):
    self.total_planned_budget = float(self.get('q1_planned_budget') or 0) + float(self.get('q2_planned_budget') or 0) + float(self.get('q3_planned_budget') or 0) + float(self.get('q4_planned_budget') or 0)
    self.total_utilisation = float(self.get('q1_utilisation') or 0) + float(self.get('q2_utilisation') or 0) + float(self.get('q3_utilisation') or 0) + float(self.get('q4_utilisation') or 0)
    if self.total_utilisation > self.total_planned_budget:
        frappe.throw("Total Utilisation can't be greater than Total Planned Buget.")