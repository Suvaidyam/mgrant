import frappe
from mgrant.utils import get_month_quarter_year_based_on_date_and_yt

def output_ach_on_update(self):
    get_all_achievement = frappe.db.get_list("Output Achievement", filters={"output": self.output}, fields=["achievement","as_on_date"],ignore_permissions=True)
    output_doc = frappe.get_doc("Output", self.output)
    monthly_keys = [f"{planning.month}-{planning.year}" for planning in output_doc.get("planning_table",[]) if output_doc.frequency == "Monthly"]
    quarterly_keys = [f"{planning.quarter}-{planning.year}" for planning in output_doc.get("planning_table",[]) if output_doc.frequency == "Quarterly"]
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.grant)
        if msgw.year_type:
            year_type = msgw.year_type
    if not get_all_achievement:
        return
    mq_utilisations = {}
    total_utilization = float(0)
    for achievement in get_all_achievement:
        if output_doc.get("frequency") == "Monthly":
            month = achievement.as_on_date.month - 1
            year = achievement.as_on_date.year
            key = f"{month}-{year}"
            if key not in monthly_keys:
                frappe.throw(f"Please enter achievements for planned months only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += achievement.achievement
        elif output_doc.get("frequency") == "Quarterly":
            month, quarter, year = get_month_quarter_year_based_on_date_and_yt(achievement.as_on_date, year_type)
            key = f"{quarter}-{year}"
            if key not in quarterly_keys:
                frappe.throw(f"Please enter achievements for planned quarters only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += achievement.achievement
        else:
            total_utilization += achievement.achievement
    # Perform validation and update planning table in the same loop
    for planning in output_doc.get("planning_table", []):
        if output_doc.get("frequency") == "Monthly":
            key = f"{planning.month}-{planning.year}"
            planning.achievement = mq_utilisations.get(key, float(0))
        elif output_doc.get("frequency") == "Quarterly":
            key = f"{planning.quarter}-{planning.year}"
            planning.achievement = mq_utilisations.get(key, float(0))
    if output_doc.get("frequency") not in ["Monthly", "Quarterly"]:
        output_doc.total_achievement = total_utilization
    output_doc.save(ignore_permissions=True)
    
def output_ach_on_trash(self):
    get_all_achievement = frappe.db.get_list("Output Achievement", filters={"output": self.output,'name':['!=',self.name]}, fields=["achievement","as_on_date"],ignore_permissions=True)
    output_doc = frappe.get_doc("Output", self.output)
    monthly_keys = [f"{planning.month}-{planning.year}" for planning in output_doc.get("planning_table",[]) if output_doc.frequency == "Monthly"]
    quarterly_keys = [f"{planning.quarter}-{planning.year}" for planning in output_doc.get("planning_table",[]) if output_doc.frequency == "Quarterly"]
    year_type = frappe.db.get_single_value("mGrant Settings", "year_type") or "Financial Year"
    if frappe.db.exists("mGrant Settings Grant Wise",self.grant):
        msgw = frappe.get_doc("mGrant Settings Grant Wise",self.grant)
        if msgw.year_type:
            year_type = msgw.year_type
    if not get_all_achievement:
        return
    mq_utilisations = {}
    total_utilization = float(0)
    for achievement in get_all_achievement:
        if output_doc.get("frequency") == "Monthly":
            month = achievement.as_on_date.month - 1
            year = achievement.as_on_date.year
            key = f"{month}-{year}"
            if key not in monthly_keys:
                frappe.throw(f"Please enter achievements for planned months only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += achievement.achievement
        elif output_doc.get("frequency") == "Quarterly":
            month, quarter, year = get_month_quarter_year_based_on_date_and_yt(achievement.as_on_date, year_type)
            key = f"{quarter}-{year}"
            if key not in quarterly_keys:
                frappe.throw(f"Please enter achievements for planned quarters only.")
            if key not in mq_utilisations:
                mq_utilisations[key] = float(0)
            mq_utilisations[key] += achievement.achievement
        else:
            total_utilization += achievement.achievement
    # Perform validation and update planning table in the same loop
    for planning in output_doc.get("planning_table", []):
        if output_doc.get("frequency") == "Monthly":
            key = f"{planning.month}-{planning.year}"
            planning.achievement = mq_utilisations.get(key, float(0))
        elif output_doc.get("frequency") == "Quarterly":
            key = f"{planning.quarter}-{planning.year}"
            planning.achievement = mq_utilisations.get(key, float(0))
    if output_doc.get("frequency") not in ["Monthly", "Quarterly"]:
        output_doc.total_achievement = total_utilization
    output_doc.save(ignore_permissions=True)