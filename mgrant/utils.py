from datetime import datetime
from frappe.utils import add_days, getdate
import frappe

def get_positive_state_closure(doctype):
    sql = f"select state, custom_closure from `tabWorkflow Document State` where parent='{doctype}' and custom_closure = 'Positive'"
    list = frappe.db.sql(sql, as_dict=1)
    if len(list) > 0:
        return list[0].state
    return None

def get_state_closure(doctype, wf_state):
    sql = f"select state, custom_closure from `tabWorkflow Document State` where parent='{doctype}' and state='{wf_state}' and custom_closure in ('Positive', 'Negative')"
    list = frappe.db.sql(sql, as_dict=1)
    if len(list) > 0:
        return list[0].custom_closure
    return None
def get_fiscal_quarter(date):
    date = datetime.strptime(str(date), '%Y-%m-%d')
    month = date.month  # month is 1-12 in Python
    if 3 < month <= 6:
        return 1
    elif 7 < month <= 9:
        return 2
    elif 10 < month <= 12:
        return 3
    else:
        return 4  # January to March

def get_fiscal_year(date):
    date = datetime.strptime(str(date), '%Y-%m-%d')
    month = date.month
    year = date.year
    return year if month > 3 else year - 1

def get_month_quarter_year_based_on_date_and_yt(date,year_type):
    month = date.month - 1
    year = date.year
    quarter = (month + 1) // 3
    if year_type == "Financial Year":
        year = get_fiscal_year(date)
        quarter = get_fiscal_quarter(date)
    return month,quarter,year

def calculate_business_days(start_date, business_days):
    count = 0
    current_date = getdate(start_date)
    while count < business_days:
        current_date = add_days(current_date, 1)
        # Skip weekends (Saturday = 5, Sunday = 6)
        if current_date.weekday() not in (5, 6):
            count += 1
    return current_date
