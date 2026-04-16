type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];
type ClassValue = ClassArray | ClassDictionary | string | null | undefined | false;

function normalizeClassValue(input: ClassValue): string[] {
	if (!input) return [];

	if (typeof input === 'string') {
		return [input];
	}

	if (Array.isArray(input)) {
		return input.flatMap((value) => normalizeClassValue(value));
	}

	return Object.entries(input)
		.filter(([, enabled]) => !!enabled)
		.map(([className]) => className);
}

export function cn(...inputs: ClassValue[]) {
	return inputs.flatMap((input) => normalizeClassValue(input)).join(' ');
}
