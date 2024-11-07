// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.query_reports["NGOs By Annual budget"] = {
	"filters": [
		{
			"fieldname": "financial_year",
			"label": __("Financial Year"),
			"fieldtype": "Link",
			"options": "Financial Year",
		}
	]
};
