import { expect } from 'chai';
import { capitalise, camelCase } from '../src/util';

describe('[src/util.js]', () => {
  describe('capitalise', () => {
    describe('input validation', () => {
      const tests = [
        { statement: 'is undefined', input: undefined },
        { statement: 'is null', input: null },
        { statement: 'is a number', input: 0 },
        { statement: 'is a boolean', input: true }
      ];

      tests.forEach((test) => {
        const { statement, input } = test;
        it(`should throw if the input ${statement}`, () => {
          // eslint-disable-next-line no-unused-expressions
          expect(() => {
            capitalise(input);
          }).to.throw;
        });
      });
    });

    const tests = [
      {
        title: 'should capitalise the first character of the string',
        input: 'input',
        expected: 'Input'
      },
      {
        title:
          `should capitalise the first character of the string,
          lowering the case of the remaining characters and trimming all whitespaces
          `,
        input: 'inPuT     ',
        expected: 'Input'
      },
      {
        title: 'should leave a capitalised string as is',
        input: 'Input',
        expected: 'Input'
      }
    ];

    tests.forEach((test) => {
      const { title, input, expected } = test;

      it(title, () => {
        const actual = capitalise(input);
        expect(actual).to.be.equal(expected);
      });
    });
  });

  describe('camelCase', () => {
    describe('input validation', () => {
      const tests = [
        { args: [undefined] },
        { args: [null] },
        { args: [0] },
        { args: [true] },
        { args: ['', null] },
        { args: ['', 0] },
        { args: ['', ''] },
        { args: ['', false, null] },
        { args: ['', true, 0] },
        { args: ['', false, true] }
      ];

      tests.forEach((test) => {
        const { args } = test;
        it('should throw if the input parameter types do not match the required ones', () => {
          // eslint-disable-next-line no-unused-expressions
          expect(() => {
            camelCase(...args);
          }).to.throw;
        });
      });
    });

    const tests = [
      {
        title: 'should remove the split separator camel-casing the words',
        args: ['one.two'],
        expected: 'oneTwo'
      },
      {
        title: 'should camel-case by removing the empty spaces',
        args: ['  one.tWo   '],
        expected: 'oneTwo'
      },
      {
        title: 'should camel-case by capitalising the first character',
        args: ['one.two', true],
        expected: 'OneTwo'
      },
      {
        title: 'should camelcase based on a specified word separator',
        args: ['one-two', true, '-'],
        expected: 'OneTwo'
      },
      {
        title: 'should leave the input untouched if the separator is not found',
        args: ['one.two', false, '-'],
        expected: 'one.two'
      },
      {
        title: 'should leave the input untouched if the separator is not found and capitalise the first character',
        args: ['one.two', true, '-'],
        expected: 'One.two'
      }
    ];

    tests.forEach((test) => {
      const { title, args, expected } = test;

      it(title, () => {
        const actual = camelCase(...args);
        expect(actual).to.be.equal(expected);
      });
    });
  });
});
