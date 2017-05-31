import Github from 'representation-source-github';
import request from 'request-promise-native';
import Representation from '../src/representation';

const token = process.env.GITHUB_TOKEN;

describe('Representation', () => {
  let representation;
  beforeEach(() => {
    representation = new Representation();
  });

  test('2+2=4', () => {
    expect(2 + 2).toEqual(4);
  });

  test('build', async () => {
    const github = new Github(
      {
        user: 'salimkayabasi',
        token,
      },
      request,
    );
    const result = await representation.addSource(github).load();
    expect(result).not.toBeNull();
  });
});
