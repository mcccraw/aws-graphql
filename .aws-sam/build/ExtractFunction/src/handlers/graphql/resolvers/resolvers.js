const {DB_MAP} = require("./db-schema");

const resolverMap = {

    Query: {
        product: (root, args, ctx, info) => {
            return ctx.db.singletable.get(DB_MAP.PRODUCT.get({productId: args.id})).then((data) => DB_MAP.PRODUCT.parse(data));
        },
        productByName: (root, args, ctx, info) => {
            return ctx.db.singletable
                .query(DB_MAP.PRODUCT.queryByName({productName: args.name}))
                .then((data) => DB_MAP.parseList(data, "PRODUCT"));
        },
        productByWarehouse: (root, args, ctx, info) => {
            return ctx.db.singletable
                .query(DB_MAP.PRODUCT.queryByWarehouseId({warehouseId: args.id}))
                .then((data) => DB_MAP.parseList(data, "PRODUCT"));
        },
        warehouse: (root, args, ctx, info) => {
            return ctx.db.singletable.get(DB_MAP.USER.get({warehouseId: args.id})).then((data) => DB_MAP.USER.parse(data));
        },
        warehouseByName: (root, args, ctx, info) => {
            console.log(DB_MAP.USER.queryByName({warehouseName: args.name}));
            return ctx.db.singletable
                .query(DB_MAP.WAREHOUSE.queryByName({warehouse: args.name}))
                .then((data) => DB_MAP.parseList(data, "WAREHOUSE"));
        },
        allWarehouses: (root, args, ctx, info) => {
            return ctx.db.singletable
                .query(DB_MAP.WAREHOUSE.queryAll)
                .then((data) => DB_MAP.parseList(data, "WAREHOUSE"));
        },
        C: (root, args, ctx, info) => {
            return ctx.db.singletable
                .query(DB_MAP.PRODUCT.queryAll)
                .then((data) => DB_MAP.parseList(data, "PRODUCT"));
        },
    },
    Product: {
        name: (root, _, ctx) => {
            if (root.name) {
                return root.name;
            } else {
                return ctx.db.singletable
                    .get(DB_MAP.PRODUCT.get({productId: root.id}))
                    .then((data) => DB_MAP.PRODUCT.parse(data).name);
            }
        },
    },
    Warehouse: {
        name: (root, _, ctx) => {
            if (root.name) {
                return root.name;
            } else {
                return ctx.db.singletable
                    .get(DB_MAP.WAREHOUSE.get({warehouseId: root.id}))
                    .then((data) => DB_MAP.WAREHOUSE.parse(data).name);
            }
        },
        products: (root, _, ctx) => {
            return ctx.db.singletable
                .query(DB_MAP.PRODUCT.queryByWarehouseId({warehouseId: root.id}))
                .then((data) => DB_MAP.parseList(data, "PRODUCT"));
        },
    },


}

module.exports = { resolverMap };