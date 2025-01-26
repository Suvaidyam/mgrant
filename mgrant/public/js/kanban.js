frappe.views.KanbanView = class KanbanView extends frappe.views.KanbanView {
    before_render() {
        if (this.doctype === "Proposal") {
            cur_list.page.set_title(__('Proposal'));
        }
        // let override = await frappe.db.get_doc("Kanban Card Setting", 'Kanban Card Setting');
        // if (override?.kanban_template?.length > 0 && override?.kanban_template?.map((row) => row.reference_doctype).includes(this.doctype)) {
        // let custom_desing = override.kanban_template.find((row) => row.reference_doctype === this.doctype);
        // let custom_card = await frappe.db.get_doc("Custom HTML Block", custom_desing.template);
        // if (custom_card && custom_card.html) {
        if (this.doctype === "Proposal") {
            frappe.views.KanbanBoardCard = function (card, wrapper) {
                var self = {};
                function init() {
                    if (!card) return;
                    make_dom(); // Customized DOM
                    render_card_meta(); // Meta information
                }
              
                function make_dom() {
                    let wf_color = 'muted';
                    if(card.doc.workflow_state){
                        let wf = frappe.wfstates?.find(wf => wf?.name === card?.doc?.workflow_state);
                        wf_color = wf?.style?.toLowerCase();
                    } else {
                        wf_color = 'muted';
                    };
                    const htmlTemplate = `
                                            <div class="\${opts.disable_click}" style="width: 227px; max-width: 227px; margin-top:10px; height: auto; border-radius: 8px; background-color: #FFFFFF; padding: 16px 12px;" data-name="\${opts?.name}">
                                                <div class="text-truncate" style="color: #111111; font-size: 14px; font-weight:500; line-height: 15.4px; letter-spacing: 0.25%; margin-bottom: 8px">
                                                    <a href="\${opts?.form_link}" style="text-decoration: none;">
                                                        \${opts?.title || 'Title Not Set'}
                                                    </a>
                                                </div>
                                                \${opts?.doc?.owner ? \`
                                                <div class="d-flex align-items-center" style="margin-bottom: 12px; gap: 4px">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 256 256">
                                                        <path fill="#6E7073" d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8M72 96a56 56 0 1 1 56 56a56.06 56.06 0 0 1-56-56" />
                                                    </svg>
                                                    <span class="text-break" style="color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.owner || ''}</span>
                                                </div> \` : ''}
                                                \${opts?.doc?.donor_donor_name ? \`
                                                <p class="text-break" style="color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%; margin-bottom: 8px;">\${opts?.doc?.donor_donor_name || ''}</p>
                                                \` : ''}
                                                
                                                \${opts?.FormattedStartDate ? \`
                                                <div class="d-flex justify-content-start "  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">Start Date:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.FormattedStartDate || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.FormattedEndDate ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">End Date:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.FormattedEndDate || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.doc?.grant_duration_in_months ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="margin-bottom: 1px; white-space: nowrap; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">Grant Duration:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.grant_duration_in_months || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.doc?.theme_theme_name ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">Theme:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.theme_theme_name || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.doc?.sdg_sdg_name ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">SDG:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.sdg_sdg_name || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.doc?.programme_programme_name ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">Programme:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.programme_programme_name || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.doc?.modified_by ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">Modified By:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.modified_by || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.FormattedModifiedDate ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">Modified:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.FormattedModifiedDate || ''}</p>
                                                </div> \` : ''}
                                                \${opts?.doc?.name ? \`
                                                <div class="d-flex justify-content-start"  style="margin-bottom: 8px; gap: 8px;">
                                                    <p style="white-space: nowrap; margin-bottom: 1px; color: #0E1116; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;;">ID:</p>
                                                    <p class="text-break" style="margin-bottom: 1px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%;">\${opts?.doc?.name || ''}</p>
                                                </div> \` : ''}
    
                                                <div class="d-flex justify-content-between" style="margin-bottom: 16px; margin-top: 8px;">
                                                    \${opts?.doc?.total_planned_budget ? \`
                                                    <p style="color: #0E1116; font-size: 14px; font-weight:600; line-height: 15.4px; letter-spacing: 0.25%; ">₹\${opts?.total_planned_budget || '0'}</p>
                                                    \` : \`<p style="color: #0E1116; font-size: 14px; font-weight:600; line-height: 15.4px; letter-spacing: 0.25%; ">₹0</p>\`}
                                                    \${opts?.FormattedDate ? \`
                                                    <p style="color: #6E7073; font-size: 10px; font-weight:400; line-height: 11px; letter-spacing: 1.5%;">Date: \${opts?.FormattedDate || ''}</p>
                                                    \` : ''}
                                                </div>
                                                \${opts?.doc?.workflow_state ? \`
                                                <span class="text-\${opts?.wf_color} border border-\${opts?.wf_color}" style="padding: 4px 8px; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%; border-radius: 100px;" aria-label="\${opts?.doc?.workflow_state}">\${opts?.doc?.workflow_state}</span>
                                                \` : ''}
                                            </div>
                                            `;

                    var opts = {
                        name: card.name || "",
                        title: frappe.utils.html2text(card.title || ""),
                        disable_click: card.disable_click ? "disable-click" : "",
                        FormattedDate: getFormattedDate(card?.doc?.modified),
                        FormattedEndDate: getFormattedDate(card?.doc?.end_date),
                        FormattedStartDate: getFormattedDate(card?.doc?.start_date),
                        FormattedModifiedDate: getFormattedDate(card?.doc?.modified),
                        form_link: frappe.utils.get_form_link(card.doctype, card.name || ""),
                        tags: card.tags?.split(",") || [],
                        doc: card.doc || {},
                        wf_color: wf_color,
                        total_planned_budget: formatCurrency(card?.doc?.total_planned_budget)
                    };

                    function formatCurrency(amount) {
                        if (typeof amount !== "number" || isNaN(amount)) {
                            return "Invalid amount";
                        }
                     
                        const suffixes = [
                            { value: 1e7, symbol: "Cr" },  // Crore
                            { value: 1e5, symbol: "L" },   // Lakh
                            { value: 1e3, symbol: "K" }    // Thousand
                        ];
                     
                        for (const { value, symbol } of suffixes) {
                            if (amount >= value) {
                                const formattedAmount = (amount / value).toFixed(1).replace(/\.0$/, ""); // Remove trailing .0
                                return `${formattedAmount}${symbol}`;
                            }
                        }
                     
                        return amount.toString(); // Return the number as is if no suffix is applicable
                    }
                     

                    const parseHTML = (_html, ctx) => {
                        // Use backticks and ensure opts is correctly passed in
                        return new Function('opts', `return \`${_html}\`;`)(ctx);
                    };
                    // Custom rendering
                    const renderedHTML = parseHTML(htmlTemplate, opts);
                    // console.log("Rendered HTML:", renderedHTML);
                    self.$card = $(renderedHTML).appendTo(wrapper);
                }

                function render_card_meta() {
                    // Add tags or other metadata
                    let html = get_tags_html(card);

                    self.$card.append(`
                            <div style="margin-top: 14px;">
                                ${html}
                            </div>
                        `);
                }

                function get_tags_html(card) {
                    const lightColors = [
                        "rgba(255, 182, 193, 0.5)", // Light Pink
                        "rgba(173, 216, 230, 0.5)", // Light Blue
                        "rgba(144, 238, 144, 0.5)", // Light Green
                        "rgba(255, 239, 213, 0.5)", // Light Peach
                        "rgba(255, 255, 224, 0.5)", // Light Yellow
                        "rgba(255, 228, 225, 0.5)", // Misty Rose
                        "rgba(240, 248, 255, 0.5)", // Alice Blue
                        "rgba(230, 230, 250, 0.5)", // Lavender
                        "rgba(250, 250, 210, 0.5)", // Light Goldenrod
                        "rgba(224, 255, 255, 0.5)", // Light Cyan
                        "rgba(255, 250, 240, 0.5)", // Floral White
                        "rgba(245, 245, 220, 0.5)", // Beige
                        "rgba(240, 255, 240, 0.5)", // Honeydew
                        "rgba(245, 255, 250, 0.5)", // Mint Cream
                        "rgba(255, 240, 245, 0.5)", // Lavender Blush
                    ];

                    return card?.tags
                        ? `<div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${card?.tags
                            .split(",")
                            .map((tag, index) => {
                                return `<span class="" style="background-color:${lightColors[index % 15]}; padding: 4px 8px; color: #6E7073; font-size: 12px; font-weight:400; line-height: 13.2px; letter-spacing: 0.4%; border-radius: 100px;" aria-label="${tag}">${tag}</span>`;
                            })
                            .join("")}
                            </div>`
                        : "";
                }

                init();
            };
        }
        // }
        // }
    }
    refresh() {
        super.refresh();

        // Ensure custom rendering logic is applied after dragging
        this.wrapper.find(".kanban-column").each((_, column) => {
            $(column)
                .find(".kanban-card")
                .each((_, cardElem) => {
                    const cardName = $(cardElem).data("name");
                    const card = this.get_card(cardName);
                    const wrapper = $(cardElem).parent();

                    // Clear existing DOM and reapply custom rendering
                    $(cardElem).remove();
                    new frappe.views.KanbanBoardCard(card, wrapper);
                });
        });
    }
}
frappe.views.ListViewSelect = class ListViewSelect extends frappe.views.ListViewSelect {
    setup_kanban_switcher(kanbans) {
        return;
    }
}
