import frappe
from mgrant.utils import get_month_quarter_year_based_on_date_and_yt

def utilization_on_update(self):
    get_all_transaction = frappe.db.get_list("Budget Transaction", filters={"budget_plan":self.budget_plan}, fields=["transaction","budget_plan","as_on_date"],ignore_permissions=True)
    buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
    monthly_keys = [f"{planning.month}-{planning.year}" for planning in buget_plan_utl_doc.get("planning_table",[]) if buget_plan_utl_doc.frequency == "Monthly"]
    quarterly_keys = [f"{planning.quarter}-{planning.year}" for planning in buget_plan_utl_doc.get("planning_table",[]) if buget_plan_utl_doc.frequency == "Quarterly"]
    annually_keys = [f"{planning.year}" for planning in buget_plan_utl_doc.get("planning_table",[]) if buget_plan_utl_doc.frequency == "Annually"]
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.grant)
        if msgw.year_type:
            year_type = msgw.year_type
    if not get_all_transaction:
        return
    mq_utilisations = {}
    for transaction in get_all_transaction:
        if buget_plan_utl_doc.get("frequency") == "Monthly":
            month = transaction.as_on_date.month - 1
            year = transaction.as_on_date.year
            key = f"{month}-{year}"
            if key not in monthly_keys:
                frappe.throw(f"Please make transactions for planned months only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction

        elif buget_plan_utl_doc.get("frequency") == "Quarterly":
            month, quarter, year = get_month_quarter_year_based_on_date_and_yt(transaction.as_on_date, year_type)
            key = f"{quarter}-{year}"
            if key not in quarterly_keys:
                frappe.throw(f"Please make transactions for planned quarters only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction

        elif buget_plan_utl_doc.get("frequency") == "Annually":
            year = transaction.as_on_date.year
            key = f"{year}"
            if key not in annually_keys:
                frappe.throw(f"Please make transactions for planned years only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction

    # Perform validation and update planning table in the same loop
    for planning in buget_plan_utl_doc.get("planning_table", []):
        if buget_plan_utl_doc.get("frequency") == "Monthly":
            key = f"{planning.month}-{planning.year}"
            planning.utilised_amount = mq_utilisations.get(key, float(0))

        elif buget_plan_utl_doc.get("frequency") == "Quarterly":
            key = f"{planning.quarter}-{planning.year}"
            planning.utilised_amount = mq_utilisations.get(key, float(0))

        elif buget_plan_utl_doc.get("frequency") == "Annually":
            key = f"{planning.year}"
            planning.utilised_amount = mq_utilisations.get(key, float(0))
    buget_plan_utl_doc.save(ignore_permissions=True)
    
def utilization_on_trash(self):
    get_all_transaction = frappe.db.get_list("Budget Transaction", filters={"budget_plan":self.budget_plan,'name':['!=',self.name]}, fields=["transaction","budget_plan","as_on_date"],ignore_permissions=True)
    buget_plan_utl_doc = frappe.get_doc("Budget Plan and Utilisation", self.budget_plan)
    monthly_keys = [f"{planning.month}-{planning.year}" for planning in buget_plan_utl_doc.get("planning_table",[]) if buget_plan_utl_doc.frequency == "Monthly"]
    quarterly_keys = [f"{planning.quarter}-{planning.year}" for planning in buget_plan_utl_doc.get("planning_table",[]) if buget_plan_utl_doc.frequency == "Quarterly"]
    annually_keys = [f"{planning.year}" for planning in buget_plan_utl_doc.get("planning_table",[]) if buget_plan_utl_doc.frequency == "Annually"]
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.grant)
        if msgw.year_type:
            year_type = msgw.year_type
    if not get_all_transaction:
        return
    mq_utilisations = {}
    for transaction in get_all_transaction:
        if buget_plan_utl_doc.get("frequency") == "Monthly":
            month = transaction.as_on_date.month - 1
            year = transaction.as_on_date.year
            key = f"{month}-{year}"
            if key not in monthly_keys:
                frappe.throw(f"Please make transactions for planned months only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction

        elif buget_plan_utl_doc.get("frequency") == "Quarterly":
            month, quarter, year = get_month_quarter_year_based_on_date_and_yt(transaction.as_on_date, year_type)
            key = f"{quarter}-{year}"
            if key not in quarterly_keys:
                frappe.throw(f"Please make transactions for planned quarters only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction

        elif buget_plan_utl_doc.get("frequency") == "Annually":
            year = transaction.as_on_date.year
            key = f"{year}"
            if key not in annually_keys:
                frappe.throw(f"Please make transactions for planned years only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += transaction.transaction

    # Perform validation and update planning table in the same loop
    for planning in buget_plan_utl_doc.get("planning_table", []):
        if buget_plan_utl_doc.get("frequency") == "Monthly":
            key = f"{planning.month}-{planning.year}"
            planning.utilised_amount = mq_utilisations.get(key, float(0))

        elif buget_plan_utl_doc.get("frequency") == "Quarterly":
            key = f"{planning.quarter}-{planning.year}"
            planning.utilised_amount = mq_utilisations.get(key, float(0))

        elif buget_plan_utl_doc.get("frequency") == "Annually":
            key = f"{planning.year}"
            planning.utilised_amount = mq_utilisations.get(key, float(0))
    buget_plan_utl_doc.save(ignore_permissions=True)