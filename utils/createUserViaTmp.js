const verifyUserAndCreate = async (row, db) => {
  const existUser = await db.users.findOne({ where: { id: row.id } });
  if (existUser) {
    existUser.set(row);
    await existUser.save();
  } else await db.users.create(row);
};

const createUserViaTmp = async (fs, path, jwt, db) => {
  const readTmp = fs.readFileSync(path, {
    encoding: "utf8",
  });
  jwt.verify(readTmp, process.env.DATA_TOKEN, async (err, decoded) => {
    if (err) return console.log("ERROR VERIFY IN APP", err);
    const rows = JSON.parse(decoded.data);
    if (rows?.length) {
      rows.map(async (row) => {
        await verifyUserAndCreate(row, db);
      });
    } else {
      await verifyUserAndCreate(rows, db);
    }
  });
};

module.exports = createUserViaTmp;
