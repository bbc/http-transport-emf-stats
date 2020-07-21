// import sinon from 'sinon';
// import { expect } from 'chai';
// import EventEmitter from 'events';
// import { addCacheEventListener, statsPlugin } from '../src/index';

// describe.only('[src/index.js]', () => {
//   describe('addCacheEventListener', () => {
//     it('should set the related cache action to true and add it to the cache audit array', () => {
//       const attempt = { cache: {} };
//       const action = 'action.subaction';
//       const cacheAudit = [];
//       addCacheEventListener(attempt, action, cacheAudit);
//       expect(attempt.cache).to.have.haveOwnProperty('actionSubaction', true);
//       expect(cacheAudit).to.be.deep.equal([action]);
//     });
//   });

//   describe('statsPlugin', () => {
//     let emitter;
//     let clientName;
//     let context;
//     let next;

//     beforeEach(() => {
//       emitter = {
//         on: sinon.spy()
//       };
//       clientName = 'test';
//       context = {
//         res: {}
//       };
//       next = sinon.spy();
//     });

//     afterEach(() => sinon.restore());

//     it('should attach the cache event listeners', async () => {
//       await statsPlugin(emitter, clientName, context, next);
//       sinon.assert.callCount(emitter.on, 7);
//       sinon.assert.calledWith(emitter.on, `cache.${clientName}.hit`);
//       sinon.assert.calledWith(emitter.on, `cache.${clientName}.miss`);
//       sinon.assert.calledWith(emitter.on, `cache.${clientName}.stale`);
//       sinon.assert.calledWith(emitter.on, `cache.${clientName}.error`);
//       sinon.assert.calledWith(emitter.on, `cache.${clientName}.timeout`);
//       sinon.assert.calledWith(emitter.on, `cache.${clientName}.revalidate`);
//       sinon.assert.calledWith(
//         emitter.on,
//         `cache.${clientName}.revalidate.error`
//       );
//     });

//     describe('stats initialisation', () => {
//       it('should call next only once', async () => {
//         await statsPlugin(emitter, clientName, context, next);
//         sinon.assert.calledOnceWithExactly(next);
//       });

//       it('should initialise the stats if next resolves', async () => {
//         next = sinon.stub().resolves();
//         await statsPlugin(emitter, clientName, context, next);
//         expect(context.res).to.haveOwnProperty('stats');
//       });

//       it('should initialise the stats if next rejects', async () => {
//         next = sinon.stub().rejects();
//         try {
//           await statsPlugin(emitter, clientName, context, next);
//         } catch {
//           expect(context.res).to.haveOwnProperty('stats');
//         }
//       });
//     });

//     describe.only('the status code', () => {
//       const tests = [
//         {
//           statusCode: 100,
//           expected: 'response1xxCount'
//         },
//         {
//           statusCode: 200,
//           expected: 'response2xxCount'
//         },
//         {
//           statusCode: 300,
//           expected: 'response3xxCount'
//         },
//         {
//           statusCode: 400,
//           expected: 'response4xxCount'
//         },
//         // {
//         //   statusCode: 500,
//         //   expected: 'response5xxCount'
//         // },
//         {
//           statusCode: 90,
//           expected: 'responseInvalidCount'
//         },
//         {
//           statusCode: 600,
//           expected: 'responseInvalidCount'
//         }
//       ];

//       tests.forEach((test) => {
//         const { statusCode, expected } = test;
//         it(`should increment ${expected} when the status code is ${statusCode}`, async () => {
//           context.res.statusCode = statusCode;
//           await statsPlugin(emitter, clientName, context, next);
//           expect(context.res.statusCode).to.be.equal(statusCode);
//           expect(context.res.stats[expected]).to.be.equal(1);
//         });
//       });
//     });

//     describe('when the response is returned from the cache', () => {
//       // it.only('should not increase the counters if is cache hit', async () => {
//       //   emitter = new EventEmitter();
//       //   const spy = sinon.spy();
//       //   next = async () => {
//       //     setTimeout(() => emitter.emit(`cache.${clientName},hit`), 500);
//       //     spy();
//       //   };
//       //   await statsPlugin(emitter, clientName, context, next);
//       //   console.log(JSON.stringify(context.res, null, 2));
//       // });

//       it('should not increase the counters if is cache stale', () => {

//       });
//     });
//   });
// });
