// Copyright (c) 2024, Suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("mGrant Letter Head", {
    async refresh(frm) {
        document.getElementById('description').innerHTML = `
                <div class="card shadow-sm border-0 mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0 text-white">Variables</h5>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-secondary">We support variables in thr format :- %variable_name%</h5>
                        <h6>Here are the variables we support : </h6>
                        <ul>
                            <li>ngo_name</li>
                            <li>donor_name</li>
                            <li>start_date (From Grant)</li>
                            <li>end_date (From Grant)</li>
                            <li>today_date</li>
                        </ul>
                    </div>
                </div>
        `
    },
});