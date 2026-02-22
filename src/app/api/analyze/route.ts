import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const incomingFormData = await request.formData();

        // Reconstruct FormData to ensure it's clean and headers are generated correctly by fetch
        const forwardingFormData = new FormData();

        // Append all fields from the incoming form data
        for (const [key, value] of incomingFormData.entries()) {
            forwardingFormData.append(key, value);
        }

        console.log("Proxying request to n8n...");

        const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/analyze-resume";
        const n8nResponse = await fetch(n8nUrl, {
            method: "POST",
            body: forwardingFormData,
        });

        const responseText = await n8nResponse.text();
        console.log("n8n response status:", n8nResponse.status);
        console.log("n8n raw response:", responseText);

        if (!n8nResponse.ok) {
            console.error("n8n error response:", responseText);

            // Try to parse the error JSON to give a better message
            try {
                const errorJson = JSON.parse(responseText);
                if (n8nResponse.status === 404 && errorJson.message?.includes("not registered")) {
                    return NextResponse.json(
                        { error: "n8n Workflow Not Active. Please open your local n8n and toggle the workflow to 'Active'." },
                        { status: 503 } // Service Unavailable is semantically better here than 404
                    );
                }
            } catch (e) {
                // ignore parsing error
            }

            throw new Error(`n8n responded with ${n8nResponse.status}: ${responseText}`);
        }

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            throw new Error(`Failed to parse n8n JSON. Raw: ${responseText.substring(0, 100)}...`);
        }
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Proxy Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
