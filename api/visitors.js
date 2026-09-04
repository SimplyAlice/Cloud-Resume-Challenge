import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const result = await sql`
            INSERT INTO visitor_counter (id, count)
            VALUES (1, 1)
            ON CONFLICT (id)
            DO UPDATE SET count = visitor_counter.count + 1
            RETURNING count;
        `;

        return res.status(200).json({
            count: result[0].count
        });

    } catch (error) {
        console.error("Visitor counter error:", error);

        return res.status(500).json({
            error: "Unable to update visitor count"
        });
    }
}
