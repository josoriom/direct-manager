import triethylamine from '../../../predictions/triethylamine.json';
import { getSignals } from '../getSignals';

describe('Setting up signals to perform optimization', () => {
  const signals = getSignals(triethylamine);
  it('First signal', () => {
    expect(signals[0]).toStrictEqual({
      atomIDs: ['10', '11', '12', '13', '17', '18'],
      diaIDs: ['daz@`DBYRYmjjhb`GzP`HeT'],
      nbAtoms: 6,
      delta: 2.611,
      atomLabel: 'H',
      js: [
        {
          assignment: ['7', '8', '9'],
          diaIDs: ['daz@`LBYRUejj`A~dHBIU@'],
          coupling: 7.162,
          multiplicity: 'q',
          distance: 3,
          selected: true,
        },
      ],
      multiplicity: 'q',
      selected: true,
    });
  });

  it('Second signal', () => {
    expect(signals[1]).toStrictEqual({
      atomIDs: ['7', '8', '9', '14', '15', '16', '19', '20', '21'],
      diaIDs: ['daz@`LBYRUejj`A~dHBIU@'],
      nbAtoms: 9,
      delta: 0.9500000000000001,
      atomLabel: 'H',
      js: [
        {
          assignment: ['10', '11'],
          diaIDs: ['daz@`DBYRYmjjhb`GzP`HeT'],
          coupling: 7.162,
          multiplicity: 't',
          distance: 3,
          selected: true,
        },
      ],
      multiplicity: 't',
      selected: true,
    });
  });
});
