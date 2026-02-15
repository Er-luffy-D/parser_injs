// String Parser

// currying funciton
const str = (s) => (parserState) => {
	const { targetString, index } = parserState;
	if (targetString.slice(index).startsWith(s)) {
		// Success
		return {
			...parserState,
			result: s,
			index: index + s.length,
		};
	}
	throw new Error(`Tried to match ${s} , but got ${targetString.slice(index, index + 10)}`);
};

const run = (parser, targetString) => {
	const initialState = {
		targetString,
		index: 0,
		result: null,
	};
	return parser(initialState);
};

// intializing the search string  in the parser

const parser = str("Hello there");

// parsing
console.log(run(parser,"Helloa there"));
