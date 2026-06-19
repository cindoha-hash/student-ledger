/* M3 – Regex Validation Rules */

export const validators = {
    description: (val) => /^\S(?:.*\S)?$/.test(val) && val.length <= 60,
    amount: (val) => /^-?(0|[1-9]\d*)(\.\d{1,2})?$/.test(val) && parseFloat(val) !== 0,
    date: (val) => {
        const re = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (!re.test(val)) return false;
        const d = new Date(val + 'T00:00:00');
        return !isNaN(d.getTime());
    },
    category: (val) => /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(val),
    complex: (val) => /(?=.*\d)(?=.*[a-zA-Z])(?=.*[^\w\s])/.test(val)
};