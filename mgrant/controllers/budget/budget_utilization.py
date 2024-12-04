import frappe
from datetime import datetime

def utilization_on_update(self):
        get_all_transaction = frappe.db.get_list("Budget Transaction", filters={"budget_plan":self.budget_plan}, fields=["transaction","budget_plan","as_on_date"],ignore_permissions=True)
        buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
        q1_uti = 0
        q2_uti = 0
        q3_uti = 0
        q4_uti = 0
        for trans in get_all_transaction:
            date_object = datetime.strptime(str(trans.as_on_date), "%Y-%m-%d")
            month_name = date_object.strftime("%B")
            if month_name in ("January", "February", "March"):
                q4_uti += trans.transaction or 0
            elif month_name in ("April", "May", "June"):
                q1_uti += trans.transaction or 0
            elif month_name in ("July", "August", "September"):
                q2_uti += trans.transaction or 0
            elif month_name in ("October", "November", "December"):
                q3_uti += trans.transaction or 0
        buget_plan_utl_doc.q1_apr_jun_utilisation = float(q1_uti)
        buget_plan_utl_doc.q2_jul_sep_utilisation = float(q2_uti)
        buget_plan_utl_doc.q3_oct_dec_utilisation = float(q3_uti)
        buget_plan_utl_doc.q4_jan_mar_planned_budget = float(q4_uti)
        buget_plan_utl_doc.save()
        
def utilization_on_trash(self):
    get_all_transaction = frappe.db.get_list("Budget Transaction", filters={"budget_plan":self.budget_plan,'name':['!=',self.name]}, fields=["transaction","budget_plan","as_on_date"])
    buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
    q1_uti = 0
    q2_uti = 0
    q3_uti = 0
    q4_uti = 0
    for trans in get_all_transaction:
        date_object = datetime.strptime(str(trans.as_on_date), "%Y-%m-%d")
        month_name = date_object.strftime("%B")
        if month_name in ("January", "February", "March"):
            q4_uti += trans.transaction
        elif month_name in ("April", "May", "June"):
            q1_uti += trans.transaction
        elif month_name in ("July", "August", "September"):
            q2_uti += trans.transaction
        elif month_name in ("October", "November", "December"):
            q3_uti += trans.transaction
    buget_plan_utl_doc.q1_apr_jun_utilisation = q1_uti
    buget_plan_utl_doc.q2_jul_sep_utilisation = q2_uti
    buget_plan_utl_doc.q3_oct_dec_utilisation = q3_uti
    buget_plan_utl_doc.q4_jan_mar_planned_budget = q4_uti
    buget_plan_utl_doc.save()