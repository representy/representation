import Representation from '../src/representation';

const GH_TOKEN = process.env.GH_TOKEN;
const LNKDN_TOKEN = process.env.LNKDN_TOKEN;

describe('Representation', () => {
  test('generate', async () => {
    const representation = new Representation({
      json: true,
      clean: true,
      folder: 'build',
      file: 'me.json',
      tokens: {
        github: GH_TOKEN,
      },
      template: {
        options: {
          backgroundColor: 'red',
        },
        // file: '../salimkayabasi.com/template.html',
        sources: {
          profile: {
            type: 'data',
            data: {
              name: 'Salim KAYABASI',
              photo: 'https://lh3.googleusercontent.com/B2G2t605HLpRlS6dEgW96LwekkQaNXvq9sRuBBijqq4tdQ0k09bnWKS0Bq8CNyqwuMYbm2uwbEaB62E=w5760-h3600-rw-no',
              title: 'Software Engineer',
              location: 'in Berlin, Germany',
              describe: 'life is almost perfect',
            },
          },
          jobs: {
            type: 'data',
            data: [
              {
                name: 'name',
                title: 'title',
                year: 'year',
              },
              {
                name: 'name',
                title: 'title',
                year: 'year',
              },
            ],
          },
          currentJob: {
            type: 'data',
            data: {
              name: 'name',
              title: 'title',
              year: 'year',
            },
          },
          github1: {
            type: 'github',
            options: {
              token: GH_TOKEN,
              user: 'salimkayabasi',
            },
          },
          github2: {
            type: 'github',
            options: {
              user: 'google',
            },
          },
          linkedin: {
            type: 'linkedin',
            options: {
              user: 'salimkayabasi',
              token: LNKDN_TOKEN,
            },
          },
        },
      },
    });
    await representation.build();
  });
});
