// filepath: c:\Users\IT LAND\Desktop\PeachFlask\frontend\src\app\utils\formDataUtils.ts

/**
 * Logs the contents of a FormData object for debugging
 * @param formData - The FormData object to log
 */
export function logFormData(formData: FormData): void {
    console.log("FormData contents:");
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }
}

/**
 * Converts a JavaScript object to FormData
 * @param data - The object to convert
 * @returns FormData object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectToFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (Array.isArray(value) || typeof value === "object") {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, value.toString());
        }
    });

    return formData;
}