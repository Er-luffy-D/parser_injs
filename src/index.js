// String Parser (till v-2)
// how parser works takes target string and input string
// state management of parser
// initializing of initialState of parser on calling
//  parser ----takes parserstate---> returns parserState
// (which acts as a input for otherparses Used in combining of parsers )

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

// currying funciton
const str = (s) => (parserState) => {
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
};

// Sequence of (combining multiple parsers)
const sequenceOf = (parsers) => (parserState) => {
	if (parserState.isError) return parserState;
	const results = [];
	let nextState = parserState;
	for (let p of parsers) {
		nextState = p(nextState);
		results.push(nextState.result);
	}

	return {
		...nextState,
		result: results,
	};
};

const run = (parser, targetString) => {
	const initialState = {
		targetString,
		index: 0,
		result: null,
		error: null,
		isError: false,
	};
	return parser(initialState);
};

// intializing the search string in the parser   |------>   str("searchString")=>return a parser
const parser = str("Hello there");

// parsing
console.log(run(parser, ""));
