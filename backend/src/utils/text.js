export function normalizeLowercaseString(value) {
	if (typeof value !== 'string') {
		return value;
	}

	return value.trim().toLowerCase();
}

export function normalizeNullableLowercaseString(value) {
	if (typeof value !== 'string') {
		return value ?? null;
	}

	const normalizedValue = value.trim().toLowerCase();
	return normalizedValue ? normalizedValue : null;
}