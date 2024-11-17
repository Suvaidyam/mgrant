# Copyright (c) 2024, Suvaidyam and contributors
# For license information, please see license.txt

import frappe
from datetime import datetime

def get_current_financial_year():
    # Get the current date
    today = datetime.today()

    # Financial year starts from April (month 4)
    if today.month >= 4:  # From April to December
        fy_start = today.year
        fy_end = today.year + 1
    else:  # From January to March
        fy_start = today.year - 1
        fy_end = today.year

    # Format the financial year as "YYYY-YY"
    fy = f"{fy_start}-{str(fy_end)[-2:]}"
    return fy

def execute(filters=None):
    if filters.get("financial_year") is None:
        filters["financial_year"] = get_current_financial_year()
    fy = filters.get("financial_year")
	
    columns = [
        {
            "label": "Budget Range",
            "fieldname": "budget_range",
            "fieldtype": "Data",
            "width": 150,
		},
        {
            "label": "NGO Count",
            "fieldname": "ngo_count",
            "fieldtype": "Int",
            "width": 150,
		}
	]
    sql = f"""
		WITH budget_ranges AS (
			SELECT 'Less than 50L' AS range_label, 0 AS min_budget, 5000000 AS max_budget
			UNION ALL
			SELECT '50L - 1 Cr', 5000000, 10000000
			UNION ALL
			SELECT '1 - 5 Cr', 10000000, 50000000
			UNION ALL
			SELECT '>5 Cr', 50000000, NULL
		)
		SELECT 
			br.range_label AS budget_range,
			COUNT(DISTINCT budgets.ngo) AS ngo_count,
			IFNULL(SUM(budgets.total_allocation), 0) AS total_allocation
		FROM 
			budget_ranges AS br
		LEFT JOIN (
			SELECT 
				proj.ngo,
				SUM(bgt.allocation) AS total_allocation
			FROM 
				`tabProject` AS proj
			INNER JOIN 
				`tabBudget` AS bgt ON proj.name = bgt.project
			WHERE
				bgt.financial_year = '{fy}'
			GROUP BY 
				proj.ngo
		) AS budgets ON 
			(budgets.total_allocation BETWEEN br.min_budget AND br.max_budget) OR 
			(br.max_budget IS NULL AND budgets.total_allocation > br.min_budget)
		GROUP BY 
			br.range_label
		ORDER BY 
			total_allocation DESC;
    """
    data = frappe.db.sql(sql, as_dict=True)
    return columns, data