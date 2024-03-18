/* eslint-disable no-undef */
const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
    BatchSpanProcessor,
    NodeTracerProvider,
    ConsoleSpanExporter,
} = require("@opentelemetry/sdk-trace-node");
const { Resource } = require("@opentelemetry/resources");
const {
    SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { RemixInstrumentation } = require("opentelemetry-instrumentation-remix");
const { ChannelCredentials, Metadata } = require("@grpc/grpc-js");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
require('dotenv').config();

const SERVICE_NAME = process.env.SERVICE_NAME;
const SERVICE_VERSION = process.env.SERVICE_VERSION;
const TRACES_ENDPOINT = process.env.TRACES_ENDPOINT;
const TRACES_USERNAME = process.env.TRACES_USERNAME;
const TRACES_API_KEY = process.env.TRACES_API_KEY;

const traceMetadata = new Metadata();
const traceAuthToken = btoa(
    `${TRACES_USERNAME}:${TRACES_API_KEY}`
);
// .toString("base64");
traceMetadata.set("Authorization", `Basic ${traceAuthToken}`);
const tempoExporter = new OTLPTraceExporter({
    url: TRACES_ENDPOINT,
    credentials: ChannelCredentials.createSsl(),
    metadata: traceMetadata,
});

const resource = new Resource({
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
});

const tempoSpanProcessor = new BatchSpanProcessor(tempoExporter);
const consoleSpanProcessor = new BatchSpanProcessor(new ConsoleSpanExporter());
const tracerProvider = new NodeTracerProvider({ resource });
tracerProvider.addSpanProcessor(consoleSpanProcessor);
tracerProvider.addSpanProcessor(tempoSpanProcessor);
tracerProvider.register();

const instrumentations = [
    new HttpInstrumentation(),
    new RemixInstrumentation(),
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

    sdk.start();
    console.log(`Telemetry initialized for ${SERVICE_NAME}.`);

    // process.on("SIGTERM", async () => {
    //     await sdk.shutdown();
    // });
} catch (error) {
    console.log(`Error terminating telemetry for ${SERVICE_NAME}.`, error);
}
