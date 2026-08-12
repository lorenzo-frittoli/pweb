const BINOMIAL_SIZE = 2 * NUMBER_OF_TERMS + 1;
const BINOMIALS = Array.from({ length: BINOMIAL_SIZE }, () => new Array(BINOMIAL_SIZE).fill(0));
for (let i = 0; i < BINOMIAL_SIZE; i++) {
	BINOMIALS[i][0] = 1;
	for (let j = 1; j <= i; j++) {
		BINOMIALS[i][j] = BINOMIALS[i - 1][j - 1] + BINOMIALS[i - 1][j];
	}
}

function binomial(i, j) {
	return BINOMIALS[i][j];
}
