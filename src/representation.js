import _ from 'lodash';

class Representation {
  constructor() {
    this.sources = [];
  }

  addSource(source) {
    this.sources.push(source);
    return this;
  }

  async load() {
    const sources = _.map(this.sources, async (source) => {
      try {
        return source.load();
      } catch (e) {
        return null;
      }
    });
    this.payload = _.compact(await Promise.all(sources));
    return this;
  }
}

export default Representation;
