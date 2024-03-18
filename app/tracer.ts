import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
    ConsoleSpanExporter,
    NodeTracerProvider,
    SimpleSpanProcessor
} from "@opentelemetry/sdk-trace-node";
import { RemixInstrumentation } from "opentelemetry-instrumentation-remix";

export const SERVICE_NAME = process.env.SERVICE_NAME || "texting_web";
const SERVICE_VERSION = process.env.SERVICE_VERSION;
const IS_TELEMETRY_ENABLED = process.env.IS_TELEMETRY_ENABLED && true;
const TRACES_ENDPOINT = process.env.TRACES_ENDPOINT;
const TRACES_USERNAME = process.env.TRACES_USERNAME;
const TRACES_API_KEY = process.env.TRACES_API_KEY;

export default async function registerTracer() {
    if (!IS_TELEMETRY_ENABLED) {
        return;
    }
    const traceMetadata = new Metadata();
    const traceAuthToken = Buffer.from(
        `${TRACES_USERNAME}:${TRACES_API_KEY}`
    ).toString("base64");
    traceMetadata.set("Authorization", `Basic ${traceAuthToken}`);
    const tempoExporter = new OTLPTraceExporter({
        url: TRACES_ENDPOINT,
        credentials: ChannelCredentials.createSsl(),
        metadata: traceMetadata,
    });

    const resource = new Resource({
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        // [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
        // [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
    });
    const tempoSpanProcessor = new SimpleSpanProcessor(tempoExporter);
    const consoleSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());
    const tracerProvider = new NodeTracerProvider({ resource });
    tracerProvider.addSpanProcessor(consoleSpanProcessor);
    tracerProvider.addSpanProcessor(tempoSpanProcessor);
    tracerProvider.register();

    const instrumentations = [
        getNodeAutoInstrumentations(),
        new HttpInstrumentation(),
        new RemixInstrumentation({
            enabled: true,
            actionFormDataAttributes: {
                _action: "actionType",
            },
            legacyErrorAttributes: true,
        }),
    ];

    registerInstrumentations({
        instrumentations,
        tracerProvider,
    });

    try {
        const sdk = new NodeSDK({
            resource,
            traceExporter: tempoExporter,
            instrumentations,
            spanProcessor: tempoSpanProcessor,
        });

        await sdk.start();
        console.log(`Telemetry initialized for ${SERVICE_NAME}.`);

        process.on("SIGTERM", async () => {
            await sdk.shutdown();
        });
    } catch (error) {
        console.log(`Error terminating telemetry for ${SERVICE_NAME}.`, error);
    }
}
