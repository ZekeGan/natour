/**
 * ## delete all data from DB
 * * node script.js --delete
 *
 * ## import JSON data into DB
 * * node script.js --import
 */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: '../../config.env' });

mongoose
  .connect(process.env.DB_REMOTE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('[DB] connect successful');
  });

// import static json file
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));

// import script
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('🪿 import successful');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// delete script
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('💥 delete successful');
    process.exit(); // node 相關
  } catch (err) {
    console.log(err);
  }
};

// console.log(process.argv[2]); // 輸入指令 node script.js --<script> 可以得到 script 字串
if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}
