frappe.views.KanbanView = class KanbanView extends frappe.views.KanbanView {
    before_render() {
        if(this.doctype === "Proposal") {
            cur_list.page.set_title(__('Proposal'));
        }
        frappe.views.KanbanBoardCard = function (card, wrapper) {
            var self = {};
            function init() {
                if (!card) return;
                make_dom(); // Customized DOM
                render_card_meta(); // Meta information
            }
        
            function make_dom() {
                console.log(card);
                // Custom DOM structure for Kanban cards
                var opts = {
                    name: card.name,
                    title: frappe.utils.html2text(card.title),
                    creation: card.creation,
                    doc_content: get_custom_doc_content(card), // Custom content function
                    disable_click : card.disable_click ? "disable-click" : "",
                    form_link: frappe.utils.get_form_link(card.doctype, card.name),
                };
        
                // Custom rendering
                self.$card = $(`
                    <div class="custom-kanban-card ${opts.disable_click}" data-name="${card.name}">
                        <div class="card-header">
                            <a href="${opts.form_link}">${opts.title}</a>
                        </div>
                        <div class="card-body">
                            ${opts.doc_content}
                        </div>
                        <div class="card-footer">
                            Created on: ${opts.creation}
                        </div>
                    </div>
                `).appendTo(wrapper);
        
                // Additional styles or behavior
                self.$card.css({
                    backgroundColor: "#f4f4f4",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "10px",
                    marginBottom: "8px",
                    cursor: frappe.model.can_write(card.doctype) ? "pointer" : "default",
                });
            }
        
            function get_custom_doc_content(card) {
                // Define how to display the card's content
                return `
                    <div>
                        <strong>Status:</strong> ${card.status || "Not Available"}
                        <br>
                        <strong>Priority:</strong> ${card.priority || "Normal"}
                    </div>
                `;
            }
        
            function render_card_meta() {
                // Add tags or other metadata
                let html = get_tags_html(card);
        
                if (card.comment_count > 0) {
                    html += `<span class="list-comment-count small text-muted">
                        ${frappe.utils.icon("comment")}
                        ${card.comment_count}
                    </span>`;
                }
        
                self.$card.append(`
                    <div class="card-meta">
                        ${html}
                    </div>
                `);
            }
        
            function get_tags_html(card) {
                // Render tags for the card
                return card.tags
                    ? `<div class="kanban-tags">
                        ${cur_list.get_tags_html(card.tags, 3, true)}
                    </div>`
                    : "";
            }
        
            init();
        };
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

