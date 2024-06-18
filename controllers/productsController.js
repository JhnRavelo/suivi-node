const { products } = require("../database/models");

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
      await getAllProducts(req, res);
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
    console.log("ERROR ADD PRODUCT", error);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const allProducts = await products.findAll();

    if (!allProducts) return res.json({ success: false });
    res.json({ success: true, products: allProducts });
  } catch (error) {
    console.log("ERROR GET ALL PRODUCT", error);
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
    await getAllProducts(req, res);
  } catch (error) {
    console.log("ERROR DELETE PRODUCT", error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      type,
      location,
      devis,
      detail,
      dimension,
      client,
      chantier,
      tech,
      id,
    } = await req.body;
    const idUser = req.user;
    let result;

    if (!type || !location || !devis || !dimension || !id)
      return res.json({ success: false });
    const updatedProduct = await products.findOne({
      where: {
        id: id,
      },
    });

    if (!updatedProduct) return res.json({ success: false });

    if (tech) {
      updatedProduct.set({
        productTypeId: type,
        location,
        detail,
        devis,
        dimension,
        userProductId: tech,
        client,
        chantier,
      });
    } else {
      updatedProduct.set({
        productTypeId: type,
        location,
        detail,
        devis,
        dimension,
        userProductId: idUser,
        client,
        chantier,
      });
    }
    result = await updatedProduct.save();

    if (!result) return res.json({ success: false });
    await getAllProducts(req, res);
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR UPDATE PRODUCT", error);
  }
};

module.exports = { addProduct, getAllProducts, deleteProduct, updateProduct };
