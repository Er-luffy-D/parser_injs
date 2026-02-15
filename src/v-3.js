// v-3
// Added Parser Class with run and map function
// letters and digits parsers using regexMatching
// choice , many and many1 implementation

class Parser {
	constructor(parserStateTransformerFn) {
		this.parserStateTransformerFn = parserStateTransformerFn;
	}
	run(targetString) {
		const initialState = {
			targetString,
			index: 0,
			result: null,
			error: null,
			isError: false,
		};
		return this.parserStateTransformerFn(initialState);
	}
	map(fn) {
		return new Parser((parserState) => {
			const nextState = this.parserStateTransformerFn(parserState);
			if (nextState.isError) {
				return nextState;
			}
			return {
				...nextState,
				result: fn(nextState.result),
			};
		});
	}
	errorMap(fn) {
		return new Parser((parserState) => {
			const nextState = this.parserStateTransformerFn(parserState);
			if (!nextState.isError) {
				return nextState;
			}
			return updateErrorMessage(nextState, fn(nextState.error, nextState.index));
		});
	}
}

const updateParserState = (state, index, result) => ({
	...state,
	index,
	result,
});
const updateErrorMessage = (state, errorMsg) => ({
	...state,
	isError: true,
	error: errorMsg,
});

const str = (s) =>
	new Parser((parserState) => {
		const { targetString, index, isError } = parserState;
		if (isError) {
			return parserState;
		}
		const slicedTarget = targetString.slice(index);
		if (slicedTarget.length === 0) {
			return updateErrorMessage(parserState, `str:Tried to match "${s}", But got Unexpected end of Input`);
		}
		if (slicedTarget.startsWith(s)) {
			// Success
			return updateParserState(parserState, index + s.length, s);
		}

		return updateErrorMessage(parserState, `Tried to match ${s} , but got ${targetString.slice(index, index + 10)}`);
	});

const letters = (() => {
	const lettersRegex = /^[A-Za-z]+/;
	return new Parser((parserState) => {
		const { targetString, index, isError } = parserState;
		if (isError) {
			return parserState;
		}
		const slicedTarget = targetString.slice(index);
		if (slicedTarget.length === 0) {
			return updateErrorMessage(parserState, `letters: Got Unexpected end of Input`);
		}
		const regexMatch = slicedTarget.match(lettersRegex);
		if (regexMatch) {
			// Success
			return updateParserState(parserState, index + regexMatch[0].length, regexMatch[0]);
		}

		return updateErrorMessage(parserState, `letters: Couldn't match letters at index ${index}`);
	});
})();
const digits = (() => {
	const lettersRegex = /^[0-9]+/;
	return new Parser((parserState) => {
		const { targetString, index, isError } = parserState;
		if (isError) {
			return parserState;
		}
		const slicedTarget = targetString.slice(index);
		if (slicedTarget.length === 0) {
			return updateErrorMessage(parserState, `letters: Got Unexpected end of Input`);
		}
		const regexMatch = slicedTarget.match(lettersRegex);
		if (regexMatch) {
			// Success
			return updateParserState(parserState, index + regexMatch[0].length, regexMatch[0]);
		}

		return updateErrorMessage(parserState, `letters: Couldn't match letters at index ${index}`);
	});
})();

const sequenceOf = (parsers) =>
	new Parser((parserState) => {
		if (parserState.isError) return parserState;
		const results = [];
		let nextState = parserState;
		for (let p of parsers) {
			nextState = p.parserStateTransformerFn(nextState);
			results.push(nextState.result);
		}

		return {
			...nextState,
			result: results,
		};
	});
const choice = (parsers) =>
	new Parser((parserState) => {
		if (parserState.isError) return parserState;
		for (let p of parsers) {
			const nextState = p.parserStateTransformerFn(parserState);
			if (!nextState.isError) {
				return nextState;
			}
		}

		return updateErrorMessage(parserState, "choice: Unable to match with any parser at index " + parserState.index);
	});
const many = (parser) =>
	new Parser((parserState) => {
		if (parserState.isError) return parserState;
		const result = [];
		let nextState = parserState;
		let done = false;
		while (!done) {
			let testState = parser.parserStateTransformerFn(nextState);
			if (!testState.isError) {
				result.push(testState.result);
				nextState = testState;
			} else {
				done = true;
			}
		}

		return {
			...nextState,
			result: result,
		};
	});
const many1 = (parser) =>
	new Parser((parserState) => {
		if (parserState.isError) return parserState;
		const result = [];
		let nextState = parserState;
		let done = false;
		while (!done) {
			nextState = parser.parserStateTransformerFn(nextState);
			if (!nextState.isError) {
				result.push(nextState.result);
			} else {
				done = true;
			}
		}
		if (result.length === 0) {
			return updateErrorMessage(nextState, "many1: Unable to match any input using @ index " + parserState.index);
		}

		return {
			...nextState,
			result: result,
		};
	});
const parser = many(choice([letters, digits]));

console.log(parser.run("a2a2aa2a2a2a2aaa2dasa"));
