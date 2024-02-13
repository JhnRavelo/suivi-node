const { products, productTypes, users } = require("../database/models");
const getProducts = require("../utils/getProducts");

const addProduct = async (req, res) => {
  try {
    const { type, location, devis, detail, dimension, client, chantier, tech } =
      await req.body;
    let productAdded;
    const idUser = req.user;

    if (!type || !location || !devis || !dimension)
      return res.json({ success: false });
    if (tech) {
      productAdded = await products.create({
        productTypeId: type,
        location,
        detail,
        devis,
        dimension,
        userProductId: tech,
        client,
        chantier,
      });

      if (!productAdded) return res.json({ success: false });

      const filterProducts = await getProducts(
        products,
        productTypes,
        users,
        res
      );
      console.log(filterProducts);

      res.json({ success: true, products: filterProducts });
    } else {
      productAdded = await products.create({
        productTypeId: type,
        location,
        detail,
        devis,
        dimension,
        userProductId: idUser,
        client,
        chantier,
      });

      if (!productAdded) return res.json({ success: false });

      res.json({ success: true, product: productAdded.id });
    }
  } catch (error) {
    res.json({ success: false });
    console.log(error);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const filterProducts = await getProducts(
      products,
      productTypes,
      users,
      res
    );

    res.json({ success: true, products: filterProducts });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) return res.json({ success: false });

    const deletedProduct = await products.findOne({
      where: {
        id: id,
      },
    });

    if (!deletedProduct) return res.json({ success: false });

    const result = await deletedProduct.destroy();

    if (!result) return res.json({ success: false });

    const filterProducts = await getProducts(
      products,
      productTypes,
      users,
      res
    );

    res.json({ success: true, products: filterProducts });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { addProduct, getAllProducts, deleteProduct };
