import Representation from '../src/representation';

const token = process.env.GITHUB_TOKEN;

describe('Representation', () => {
  test('generate', async () => {
    const representation = new Representation({
      tokens: {
        github: token,
      },
      sources: {
        github: {
          user: 'salimkayabasi',
        },
      },
    });
    await representation.build();
  });
});
