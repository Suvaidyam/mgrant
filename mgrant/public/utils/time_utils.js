const getFormattedTime = async (time) => {
    let t = new Date(time);
    let format = await frappe.db.get_single_value('System Settings', 'time_format');
    let formatted_time = '';

    const padZero = (num) => (num < 10 ? '0' : '') + num;

    const hours = padZero(t.getHours());
    const minutes = padZero(t.getMinutes());
    const seconds = padZero(t.getSeconds());

    if (format === 'HH:mm:ss') {
        formatted_time = `${hours}:${minutes}:${seconds}`;
    } else if (format === 'HH:mm') {
        formatted_time = `${hours}:${minutes}`;
    } else {
        throw new Error(`Unsupported time format: ${format}`);
    }
    return formatted_time;
};
