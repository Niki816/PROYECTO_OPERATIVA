function simplexMinimizacion(data) {
    const { numVars, numConstraints, optimization, objective, constraints } = data;

    let tableau = [];
    let numRows = numConstraints + 1;
    let numCols = numVars + numConstraints + 1;

    for (let i = 0; i < numRows; i++) {
        tableau[i] = new Array(numCols).fill(0);
    }

    for (let i = 0; i < numVars; i++) {
        tableau[0][i] = optimization === 'Minimizar' ? -objective[i] : objective[i];
    }

    for (let i = 1; i < numRows; i++) {
        const constraint = constraints[i - 1];
        for (let j = 0; j < numVars; j++) {
            tableau[i][j] = constraint.coefficients[j];
        }
        tableau[i][numVars + i - 1] = 1; 

        tableau[i][numCols - 1] = constraint.value;
    }

    const solution = simplexMetododo(tableau);

    let optimalValue = tableau[0][numCols - 1];
    if (optimization === 'Minimizar') {
        optimalValue = -optimalValue;
    }

    return { solution, optimalValue };
}

function simplexMetododo(tableau) {
    const numRows = tableau.length;
    const numCols = tableau[0].length;
    const epsilon = 1e-8;

    while (true) {
        let pivotCol = -1;
        let minValue = 0;
        for (let j = 0; j < numCols - 1; j++) {
            if (tableau[0][j] < minValue - epsilon) {
                minValue = tableau[0][j];
                pivotCol = j;
            }
        }

        if (pivotCol === -1) {
            break;
        }

        let pivotRow = -1;
        let minRatio = Infinity;
        for (let i = 1; i < numRows; i++) {
            if (tableau[i][pivotCol] > epsilon) {
                const ratio = tableau[i][numCols - 1] / tableau[i][pivotCol];
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        if (pivotRow === -1) {
            throw new Error('Solución ilimitada.');
        }

        pivot(tableau, pivotRow, pivotCol);
    }

    const numVars = tableau[0].length - tableau.length; 
    const solution = new Array(numVars).fill(0);
    for (let j = 0; j < numVars; j++) {
        let isBasic = false;
        let basicRow = -1;
        for (let i = 1; i < numRows; i++) {
            if (Math.abs(tableau[i][j] - 1) < epsilon) {
                if (isBasic) {
                    isBasic = false;
                    break;
                } else {
                    isBasic = true;
                    basicRow = i;
                }
            } else if (Math.abs(tableau[i][j]) > epsilon) {
                isBasic = false;
                break;
            }
        }
        if (isBasic) {
            solution[j] = tableau[basicRow][tableau[0].length - 1];
        }
    }

    return solution;
}

function pivot(tableau, pivotRow, pivotCol) {
    const numRows = tableau.length;
    const numCols = tableau[0].length;
    const pivotValue = tableau[pivotRow][pivotCol];

    for (let j = 0; j < numCols; j++) {
        tableau[pivotRow][j] /= pivotValue;
    }

    for (let i = 0; i < numRows; i++) {
        if (i !== pivotRow) {
            const factor = tableau[i][pivotCol];
            for (let j = 0; j < numCols; j++) {
                tableau[i][j] -= factor * tableau[pivotRow][j];
            }
        }
    }
}
