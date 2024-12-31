import frappe
from mgrant.utils import get_month_quarter_year_based_on_date_and_yt

def utilization_on_update(self):
    get_all_transaction = frappe.db.get_list("Budget Transaction", filters={"budget_plan":self.budget_plan}, fields=["transaction","budget_plan","as_on_date"],ignore_permissions=True)
    buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.grant)
        if msgw.year_type:
            year_type = msgw.year_type
    if not get_all_transaction:
        return
    mq_utilisations = {}
    total_utilization = float(0)
    for transaction in get_all_transaction:
        month , quarter , year = get_month_quarter_year_based_on_date_and_yt(transaction.as_on_date,year_type)
        if buget_plan_utl_doc.get("frequency") == "Monthly":
            key = f"{month}-{year}"
            if key not in mq_utilisations.keys():
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction
        elif buget_plan_utl_doc.get("frequency") == "Quarterly":
            key = f"{quarter}-{year}"
            if key not in mq_utilisations.keys():
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction
        else:
            total_utilization += transaction.transaction
    
    if buget_plan_utl_doc.get("frequency") == "Monthly":
        if len(buget_plan_utl_doc.get("planning_table")) > 0:
            for planning in buget_plan_utl_doc.get("planning_table"):
                key = f"{planning.month}-{planning.year}"
                if key in mq_utilisations.keys():
                    # Add Validation for Utilisation
                    planning.utilised_amount = mq_utilisations[key]
                else:
                    planning.utilised_amount = float(0)
    
    elif buget_plan_utl_doc.get("frequency") == "Quarterly":
        if len(buget_plan_utl_doc.get("planning_table")) > 0:
            for planning in buget_plan_utl_doc.get("planning_table"):
                key = f"{planning.quarter}-{planning.year}"
                if key in mq_utilisations.keys():
                    # Add Validation for Utilisation
                    planning.utilised_amount = mq_utilisations[key]
                else:
                    planning.utilised_amount = float(0)
    else:
        buget_plan_utl_doc.total_utilisation = total_utilization
    buget_plan_utl_doc.save(ignore_permissions=True)
    
def utilization_on_trash(self):
    get_all_transaction = frappe.db.get_list("Budget Transaction", filters={"budget_plan":self.budget_plan,'name':['!=',self.name]}, fields=["transaction","budget_plan","as_on_date"],ignore_permissions=True)
    buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.grant)
        if msgw.year_type:
            year_type = msgw.year_type
    if not get_all_transaction:
        return
    mq_utilisations = {}
    total_utilization = float(0)
    for transaction in get_all_transaction:
        month , quarter , year = get_month_quarter_year_based_on_date_and_yt(transaction.as_on_date,year_type)
        if buget_plan_utl_doc.get("frequency") == "Monthly":
            key = f"{month}-{year}"
            if key not in mq_utilisations.keys():
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction
        elif buget_plan_utl_doc.get("frequency") == "Quarterly":
            key = f"{quarter}-{year}"
            if key not in mq_utilisations.keys():
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction
        else:
            total_utilization += transaction.transaction
    
    if buget_plan_utl_doc.get("frequency") == "Monthly":
        if len(buget_plan_utl_doc.get("planning_table")) > 0:
            for planning in buget_plan_utl_doc.get("planning_table"):
                key = f"{planning.month}-{planning.year}"
                if key in mq_utilisations.keys():
                    # Add Validation for Utilisation
                    planning.utilised_amount = mq_utilisations[key]
                else:
                    planning.utilised_amount = float(0)
    
    elif buget_plan_utl_doc.get("frequency") == "Quarterly":
        if len(buget_plan_utl_doc.get("planning_table")) > 0:
            for planning in buget_plan_utl_doc.get("planning_table"):
                key = f"{planning.quarter}-{planning.year}"
                if key in mq_utilisations.keys():
                    # Add Validation for Utilisation
                    planning.utilised_amount = mq_utilisations[key]
                else:
                    planning.utilised_amount = float(0)
    else:
        buget_plan_utl_doc.total_utilisation = total_utilization
    buget_plan_utl_doc.save(ignore_permissions=True)