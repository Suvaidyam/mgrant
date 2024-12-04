import frappe

def budget_validate(self):
    self.total_planned_budget = float(self.get('q1_apr_jun_planned_budget') or 0) + float(self.get('q2_jul_sep_planned_budget') or 0) + float(self.get('q3_oct_dec_planned_budget') or 0) + float(self.get('q4_jan_mar_planned_budget') or 0)
    self.total_utilisation = float(self.get('q1_apr_jun_utilisation') or 0) + float(self.get('q2_jul_sep_utilisation') or 0) + float(self.get('q3_oct_dec_utilisation') or 0) + float(self.get('q4_jan_mar_utilisation') or 0)
    if self.total_utilisation > self.total_planned_budget:
        frappe.throw("Total Utilisation can't be greater than Total Planned Buget.")