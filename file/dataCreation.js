const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
dotenv.config({ path: './../config.env' });
const Data = require('./../models/recipeModels');
const fs = require('fs');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log('DB Connected');
});

const data = JSON.parse(fs.readFileSync(`${__dirname}/file.json`, 'utf-8'));

const importData = async () => {
  try {
    await Data.create(data);
    console.log('Data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Data.deleteMany();
    console.log('All data deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
