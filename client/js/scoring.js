var _scoreMap = {
	'A': 1,
	'B': 6,
	'C': 6,
	'D': 2,
	'E': 1,
	'F': 6,
	'G': 4,
	'H': 4,
	'I': 4,
	'J': 10,
	'K': 8,
	'L': 4,
	'M': 6,
	'N': 4,
	'O': 1,
	'P': 6,
	'Q': 12,
	'R': 2,
	'S': 2,
	'T': 2,
	'U': 4,
	'V': 8,
	'W': 6,
	'X': 10,
	'Y': 8,
	'Z': 12
}


function scoreForLetter( letter ) {
	return _scoreMap[letter];
}