const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');

const connectionString = process.env.AzureWebJobsStorage;
const tableName = "VisitorCounter";

const client = TableClient.fromConnectionString(connectionString, tableName);

app.http('VisitorCounter', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        try {

            let entity;

            try {
                entity = await client.getEntity("visitor", "count");
            } catch {

                entity = {
                    partitionKey: "visitor",
                    rowKey: "count",
                    count: 0
                };

                await client.createEntity(entity);
            }

            entity.count++;

            await client.updateEntity(entity, "Replace");

            return {
                jsonBody: {
                    count: entity.count
                }
            };

        } catch (err) {

            context.log(err);

            return {
                status: 500,
                body: err.message
            };
        }

    }
});