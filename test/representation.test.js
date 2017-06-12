import Representation from '../src/representation';

const token = process.env.GITHUB_TOKEN;

describe('Representation', () => {
  test('generate', async () => {
    const representation = new Representation({
      json: true,
      file: 'salim.json',
      profile: {
        name: 'Salim KAYABASI',
        photo: 'https://lh3.googleusercontent.com/B2G2t605HLpRlS6dEgW96LwekkQaNXvq9sRuBBijqq4tdQ0k09bnWKS0Bq8CNyqwuMYbm2uwbEaB62E=w5760-h3600-rw-no',
        title: 'Software Engineer',
        location: 'in Berlin, Germany',
        describe: 'life is almost perfect',
      },
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
