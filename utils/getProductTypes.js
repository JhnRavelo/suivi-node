const getProductTypes = async (productTypes, res, Op) => {
    const allProductTypes = await productTypes.findAll({where: {
        name: {
            [Op.not]: null
        }
    }});

    if (!allProductTypes) return res.json({ success: false });
    
    return allProductTypes
}

module.exports = getProductTypes