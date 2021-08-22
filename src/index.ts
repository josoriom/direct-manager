import { Boundaries } from './types/Boundaries';
import { Coupling } from './types/Coupling';
import { Parameter } from './types/Parameter';
import { Signal } from './types/Signal';
import { getCouplings } from './utilities/getCouplings';
import { getSignals } from './utilities/getSignals';
import { roundTo } from './utilities/roundTo';

/**
 * DIviding RECTangles manager for NMR spectra optimization
 * @param {Array} prediction - Prediction obtained with SPINUS
 */
export default class DirectManager {
  public prediction: Signal[];
  public couplings: Coupling[];
  public signals: Signal[];
  public constructor(prediction: Signal[]) {
    this.prediction = prediction.slice();
    this.signals = getSignals(prediction);
    this.couplings = getCouplings(prediction);
  }

  public getSignals() {
    return this.signals;
  }

  public getParameters() {
    const signals = this.signals.slice();
    const couplings = this.couplings.slice();
    let result: Parameter[] = [];
    for (const coupling of couplings) {
      result.push({
        type: 'coupling',
        atom: coupling.ids,
        atomIDs: setAtomIDs(coupling.ids, signals),
        value: { prediction: coupling.coupling, selected: coupling.selected },
      });
    }
    for (const atom of signals) {
      result.push({
        type: 'delta',
        atom: atom.diaIDs,
        atomIDs: setAtomIDs(atom.diaIDs, signals),
        value: { prediction: atom.delta, selected: atom.selected },
      });
    }
    return result;
  }

  public suggestBoundaries(options: Options = {}) {
    const parameters = this.getParameters();
    const { error = 0.1 } = options;
    const result: Parameter[] = [];
    for (const parameter of parameters) {
      let atom: Parameter = {
        atom: parameter.atom,
        type: parameter.type,
        value: {
          prediction: parameter.value.prediction,
          lower: roundTo(parameter.value.prediction - error),
          upper: roundTo(parameter.value.prediction + error),
          selected: parameter.value.selected,
        },
        atomIDs: parameter.atomIDs,
      };
      result.push(atom);
    }
    return result;
  }

  public getBoundaries(parameters?: Parameter[], options: Options = {}) {
    const { error = 0.1 } = options;
    parameters = parameters
      ? parameters
      : this.suggestBoundaries({ error: error });
    const result: Boundaries = { lower: [], upper: [] };
    for (const parameter of parameters) {
      if (!parameter.value.selected) continue;
      result.lower.push(parameter.value.lower as number);
      result.upper.push(parameter.value.upper as number);
    }
    return result;
  }

  public tidyUpParameters() {
    const result = this.signals.slice();
    const couplings = this.couplings.slice().filter((item) => item.selected);
    let counter = 0;
    return function (parameters: number[]) {
      for (const coupling of couplings) {
        if (!coupling.selected) continue;
        coupling.coupling = parameters[counter++];
      }
      for (const atom of result) {
        const relatedAtoms = findCoupling(atom.diaIDs[0], couplings);
        if (atom.selected) {
          atom.delta = parameters[counter++];
        }

        for (const jcoupling of atom.j) {
          const coupling = findCoupling(jcoupling.diaID, relatedAtoms);
          jcoupling.coupling =
            coupling.length === 0 ? jcoupling.coupling : coupling[0].coupling;
        }
      }
      counter = 0;
      return result;
    };
  }
}

function findCoupling(id: string, couplings: Coupling[]) {
  const result: Coupling[] = [];
  for (let coupling of couplings) {
    for (let value of coupling.ids) {
      if (value === id) result.push(coupling);
    }
  }
  return result;
}

function setAtomIDs(atomIDs: string[], prediction: Signal[]) {
  const IDs = prediction.map((item) => item.diaIDs[0]);
  const result: string[] = [];
  for (const atomID of atomIDs) {
    const index = IDs.indexOf(atomID);
    result.push(`H${index + 1}`);
  }
  return result;
}

/**
 * @default options.error [0.001]
 */
interface Options {
  error?: number;
}
