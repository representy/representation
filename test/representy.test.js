const { readFileSync } = require('fs');
const { safeLoad } = require('js-yaml');

const config = safeLoad(readFileSync('./config.yml').toString());
const build = require('../src/representy');
//
// const config = {
//   options: {
//     cname: 'salimkayabasi.com',
//     title: 'Salim KAYABASI',
//   },
//   render: {
//     theme: 'representy-theme/pulp#master',
//   },
//   components: [
//     {
//       category: 'profile',
//       with: {
//         name: 'Salim KAYABASI',
//         photo: 'https://avatars2.githubusercontent.com/u/1138037',
//         title: 'Software Engineer',
//         location: 'Berlin, Germany',
//         describe: 'life is almost perfect',
//       },
//     },
//   ],
// };
build(config);
