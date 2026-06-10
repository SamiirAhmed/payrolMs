export function makeCrudService(collection) {
  return {
    async list() {
      return Promise.resolve(collection);
    },
    async getById(id) {
      return Promise.resolve(collection.find((item) => Number(item.id) === Number(id)));
    },
    async create(payload) {
      return Promise.resolve({ id: Date.now(), ...payload });
    },
    async update(id, payload) {
      return Promise.resolve({ id, ...payload });
    },
    async remove(id) {
      return Promise.resolve({ success: true, id });
    }
  };
}
