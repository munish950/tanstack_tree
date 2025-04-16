const { faker } = require('@faker-js/faker');
const { writeFileSync } = require('fs');

const range = (len) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

function makeFlatData(...lens) {
  const dataMap = new Map();

  const createPerson = (parentId) => {
    const id = faker.string.uuid();
    const person = {
      id,
      parentId,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.int(40),
      visits: faker.number.int(1000),
      progress: faker.number.int(100),
      status: faker.helpers.shuffle(['relationship', 'complicated', 'single'])[0],
      children: [],
    };
    dataMap.set(id, person);
    return person;
  };

  const buildLevel = (depth = 0, parentId) => {
    const len = lens[depth]; // How many nodes to generate at this depth
    for (let i = 0; i < len; i++) {
      const person = createPerson(parentId); // Create the person

      // If it's not a root node, assign it to its parent
      if (parentId) {
        const parent = dataMap.get(parentId);
        if (parent) {
          parent.children.push(person.id);
        }
      }

      // If there are more levels, go deeper
      if (lens[depth + 1]) {
        buildLevel(depth + 1, person.id); // Recursively create child nodes
      }
    }
  };

  buildLevel(); // Start with the root level (depth = 0)

  return dataMap;
}

// Generate your data and write to file
const data = Array.from(makeFlatData(5, 100, 100).values()); // Example: 2 root nodes, 50 nodes at first level, 30 nodes at second level
writeFileSync('db.json', JSON.stringify({ persons: data }, null, 2));
console.log('✅ db.json created with tree structure based on depth and node count');