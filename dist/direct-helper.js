/**
 * direct-helper - helper
 * @version v0.0.0
 * @link https://github.com/cheminfo/direct-helper#readme
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.directHelper = factory());
}(this, (function () { 'use strict';

  /**
   * Returns a very important number
   * @return {number}
   */
  class DirectHelper {
    constructor(prediction, options = {}) {
      this.prediction = prediction;
      let parameters = [];

      for (let atom of prediction) {
        let item = {};
        item.delta = atom.delta;
        item.multiplicity = atom.multiplicity;
        item.j = [];

        for (let j of atom.j) {
          item.j.push(j.coupling);
        }

        parameters.push(item);
      }

      this.parameters = parameters;
    }

    getParameters() {
      return this.parameters;
    }

    suggestBoundaries(options = {}) {
      const parameters = this.parameters;
      const {
        width = 0.1
      } = options;
      let result = [];

      for (let parameter of parameters) {
        let atom = {};
        atom.lowerDelta = roundTo(parameter.delta - width);
        atom.upperDelta = roundTo(parameter.delta + width);
        atom.lowerJcoupling = [];
        atom.upperJcoupling = [];

        for (let coupling of parameter.j) {
          atom.lowerJcoupling.push(roundTo(coupling - width));
          atom.upperJcoupling.push(roundTo(coupling + width));
        }

        result.push(atom);
      }

      return result;
    }

    getBoundaries(options = {}) {
      const {
        boundaries = this.suggestBoundaries()
      } = options;
      let result = {
        lower: [],
        upper: []
      };

      for (let atom of boundaries) {
        result.lower.push(atom.lowerDelta);
        result.upper.push(atom.upperDelta);

        for (let i = 0; i < atom.lowerJcoupling.length; i++) {
          result.lower.push(atom.lowerJcoupling[i]);
          result.upper.push(atom.upperJcoupling[i]);
        }
      }

      return result;
    }

    tidyUpParameters() {
      let result = this.prediction.slice();
      let counter = 0;
      return function (parameters) {
        for (let atom of result) {
          atom.delta = parameters[counter++];

          for (let jcoupling of atom.j) {
            jcoupling.coupling = parameters[counter++];
          }
        }

        counter = 0;
        return result;
      };
    }

  }

  function roundTo(number, options = {}) {
    const {
      decimals = 4
    } = options;
    const power = 10 ** decimals;
    return Math.round(number * power) / power;
  }

  return DirectHelper;

})));
//# sourceMappingURL=direct-helper.js.map
