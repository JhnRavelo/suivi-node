const getSuivis = async (suivis, users, products, productTypes) => {
    const allSuivis = await suivis.findAll({
        include: [
          { model: users },
          { model: products, include: [{ model: productTypes }] },
        ],
      });
  
      if (!allSuivis) return res.json({ success: false });
  
      const filterSuivis = allSuivis.map((item) => {
        let value = item.dataValues;
  
        return {
          tech: value.user.name,
          id: value.id,
          type: value.product.productType.name,
          problem: value.problem,
          solution: value.solution,
          observation: value.observation,
          chantier: value.product.chantier,
          client: value.product.client,
          devis: value.product.devis,
          createdAt: value.createdAt
        };
      });
      return filterSuivis
}

module.exports = getSuivis