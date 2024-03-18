const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
    BatchSpanProcessor,
    ConsoleSpanExporter,
} = require("@opentelemetry/sdk-trace-node");
const { Resource } = require("@opentelemetry/resources");
const {
    SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { RemixInstrumentation } = require("opentelemetry-instrumentation-remix");
// export const SERVICE_NAME = process.env.SERVICE_NAME || "texting_web";
// const SERVICE_VERSION = process.env.SERVICE_VERSION;
// const IS_TELEMETRY_ENABLED = process.env.IS_TELEMETRY_ENABLED && true;
// const TRACES_ENDPOINT = process.env.TRACES_ENDPOINT;
// const TRACES_USERNAME = process.env.TRACES_USERNAME;
// const TRACES_API_KEY = process.env.TRACES_API_KEY;

const resource = new Resource({
    service: "texting_web",
    version: "1.1",
    // [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    // [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
});

const instrumentations = [new RemixInstrumentation()];

try {
    const sdk = new NodeSDK({
        resource,
        instrumentations,
        spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
    });

    sdk.start();
    console.log(`Telemetry initialized for texting_web.`);

    // process.on("SIGTERM", async () => {
    //     await sdk.shutdown();
    // });
} catch (error) {
    console.log(`Error terminating telemetry for texting_web.`, error);
}
