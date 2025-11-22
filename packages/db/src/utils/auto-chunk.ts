import { isPlainObject } from "lodash";
import invariant from "tiny-invariant";

// D1 has a limit of maximum 100 parameters per query.
// https://developers.cloudflare.com/d1/platform/limits/
// We leave some buffer for other parameters with default values.
const D1_MAX_PARAMETERS = 80;

export const autochunk = async <
	T extends Record<string, unknown> | string | number,
	U,
>(
	{
		items,
		otherParametersCount = 0,
	}: {
		items: T[];
		otherParametersCount?: number;
	},
	cb: (chunk: T[]) => Promise<U>,
) => {
	const chunks: T[][] = [];

	let chunk: T[] = [];
	let chunkParameters = 0;

	if (otherParametersCount > D1_MAX_PARAMETERS) {
		throw new Error(
			`otherParametersCount cannot be more than ${D1_MAX_PARAMETERS}`,
		);
	}

	for (const item of items) {
		const itemParameters = isPlainObject(item) ? Object.keys(item).length : 1;

		if (itemParameters > D1_MAX_PARAMETERS) {
			throw new Error(`Item has too many parameters (${itemParameters})`);
		}

		if (
			chunkParameters + itemParameters + otherParametersCount >
			D1_MAX_PARAMETERS
		) {
			chunks.push(chunk);
			chunkParameters = itemParameters;
			chunk = [item];

			continue;
		}

		chunk.push(item);
		chunkParameters += itemParameters;
	}

	if (chunk.length) {
		chunks.push(chunk);
	}

	const results: U[] = [];

	for (let i = 0; i < chunks.length; i++) {
		const currentChunk = chunks[i];
		invariant(currentChunk != null, `Chunks at index ${i} cannot be empty`);
		const result = await cb(currentChunk);
		results.push(result);
	}

	return results.flat();
};
