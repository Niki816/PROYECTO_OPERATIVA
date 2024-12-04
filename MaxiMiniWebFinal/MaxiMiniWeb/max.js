function simplexMaximizacion(data) {
    const { numVars, numConstraints, objective, constraints } = data;

    const tableau = createTableau(numVars, numConstraints, objective, constraints, false);

    console.log("Tabla inicial de maximización:", tableau);

    try {
        const result = runSimplexAlgorithm(tableau);

        const optimalValue = result.optimalValue;
        console.log("Tabla final de maximización:", tableau);

        return { solution: result.solution, optimalValue };
    } catch (error) {
        console.error("Error en maximización:", error.message);
        throw error;
    }
}

function createTableau(numVars, numConstraints, objective, constraints, minimize) {
    const tableau = [];
    const numCols = numVars + numConstraints + 1; 

    for (let i = 0; i <= numConstraints; i++) {
        tableau[i] = Array(numCols).fill(0);
    }

    for (let i = 0; i < numVars; i++) {
        tableau[0][i] = -objective[i]; 
    }

    for (let i = 0; i < numConstraints; i++) {
        const { coefficients, value, sign } = constraints[i];

        if (sign === ">=") {

            const convertedCoefficients = coefficients.map(coef => -coef);
            const convertedValue = -value;
            for (let j = 0; j < numVars; j++) {
                tableau[i + 1][j] = convertedCoefficients[j];
            }

            tableau[i + 1][numVars + i] = 1;
            tableau[i + 1][numCols - 1] = convertedValue;
        } else if (sign === "<=") {
            for (let j = 0; j < numVars; j++) {
                tableau[i + 1][j] = constraints[i].coefficients[j];
            }
            tableau[i + 1][numVars + i] = 1;
            tableau[i + 1][numCols - 1] = value;
        } else {
            throw new Error(`Signo de restricción no soportado: ${sign}`);
        }
    }

    return tableau;
}

function runSimplexAlgorithm(tableau) {
    const numRows = tableau.length;
    const numCols = tableau[0].length;

    while (true) {
        let pivotCol = -1;
        let minValue = 0;

        for (let j = 0; j < numCols - 1; j++) {
            if (tableau[0][j] < minValue) {
                minValue = tableau[0][j];
                pivotCol = j;
            }
        }

        if (pivotCol === -1) break;

        let pivotRow = -1;
        let minRatio = Infinity;

        for (let i = 1; i < numRows; i++) {
            if (tableau[i][pivotCol] > 0) {
                const ratio = tableau[i][numCols - 1] / tableau[i][pivotCol];
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        if (pivotRow === -1) throw new Error("El problema no tiene solución");

        pivot(tableau, pivotRow, pivotCol);
    }

    const solution = extractSolution(tableau);
    const optimalValue = tableau[0][tableau[0].length - 1];

    return { solution, optimalValue };
}

function extractSolution(tableau) {
    const numVars = tableau[0].length - tableau.length; 
    const solution = Array(numVars).fill(0);

    for (let i = 0; i < numVars; i++) {
        for (let j = 1; j < tableau.length; j++) {
            if (tableau[j][i] === 1) {
                solution[i] = tableau[j][tableau[0].length - 1];
                break;
            }
        }
    }

    return solution;
}

function pivot(tableau, pivotRow, pivotCol) {
    const pivotValue = tableau[pivotRow][pivotCol];

    for (let j = 0; j < tableau[0].length; j++) {
        tableau[pivotRow][j] /= pivotValue;
    }

    for (let i = 0; i < tableau.length; i++) {
        if (i !== pivotRow) {
            const factor = tableau[i][pivotCol];
            for (let j = 0; j < tableau[0].length; j++) {
                tableau[i][j] -= factor * tableau[pivotRow][j];
            }
        }
    }
}