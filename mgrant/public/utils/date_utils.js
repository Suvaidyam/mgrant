const getFormattedDate = async (date) => {
    let d = new Date(date);
    let format = await frappe.db.get_single_value('System Settings', 'date_format');
    let formatted_date = '';

    const padZero = (num) => (num < 10 ? '0' : '') + num;

    const day = padZero(d.getDate());
    const month = padZero(d.getMonth() + 1); // Months are zero-based
    const year = d.getFullYear();

    if (format === 'dd-mm-yyyy') {
        formatted_date = `${day}-${month}-${year}`;
    } else if (format === 'mm-dd-yyyy') {
        formatted_date = `${month}-${day}-${year}`;
    } else if (format === 'yyyy-mm-dd') {
        formatted_date = `${year}-${month}-${day}`;
    } else if (format === 'yyyy-dd-mm') {
        formatted_date = `${year}-${day}-${month}`;
    } else if (format === 'dd/mm/yyyy') {
        formatted_date = `${day}/${month}/${year}`;
    } else if (format === 'dd.mm.yyyy') {
        formatted_date = `${day}.${month}.${year}`;
    } else if (format === 'mm/dd/yyyy') {
        formatted_date = `${month}/${day}/${year}`;
    } else {
        formatted_date = `${year}/${month}/${day}`;
    }
    return formatted_date;
};